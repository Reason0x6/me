import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DeviceDisplayComponent } from '../jazz-device/components/device-display.component';

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';

const METER_BAR_COUNT = 12;
const PLAYER_POLL_INTERVAL_MS = 250;
const MAX_RECENT_TRACKS = 8;
const INITIAL_TITLE_BATCH_DELAY_MS = 1200;
const INITIAL_TITLE_BATCH_SIZE = 10;
const RECURRING_TITLE_BATCH_SIZE = 5;
const TITLE_FETCH_STAGGER_MS = 300;
const TITLE_REFILL_INTERVAL_MS = 60_000;

let youtubeIframeApiPromise: Promise<void> | null = null;

interface RecentTrack {
  readonly author: string;
  readonly title: string;
  readonly url: string;
  readonly videoId: string;
}

interface YouTubeSource {
  readonly inputUrl: string;
  readonly kind: 'playlist' | 'video';
  readonly playlistId: string | null;
  readonly videoId: string | null;
}

interface UpNextItem {
  readonly index: number;
  readonly isCurrent: boolean;
  readonly title: string;
  readonly videoId: string;
}

@Component({
  selector: 'app-tp7-youtube',
  standalone: true,
  imports: [CommonModule, DeviceDisplayComponent, FormsModule, RouterLink],
  templateUrl: './tp7-youtube.component.html',
  styleUrl: './tp7-youtube.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tp7YoutubeComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerHost = viewChild.required<ElementRef<HTMLDivElement>>('playerHost');
  private readonly pendingTitleRequests = new Map<string, AbortController>();
  private readonly queuedTitleIds = new Set<string>();

  private player: YouTubePlayer | null = null;
  private pollHandle: number | null = null;
  private titleBatchTimer: number | null = null;
  private titleRefillTimer: number | null = null;
  private titleQueueBusy = false;
  private deferredTitleBatchSize = 0;
  private scheduledTitlePlaylistId: string | null = null;

  readonly meterBars = Array.from({ length: METER_BAR_COUNT }, (_, index) => index);

  readonly urlInput = signal('');
  readonly activeVideoId = signal<string | null>(null);
  readonly activePlaylistId = signal<string | null>(null);
  readonly status = signal<PlayerStatus>('idle');
  readonly errorMessage = signal('');
  readonly sourceTitle = signal('No source loaded');
  readonly sourceAuthor = signal('Paste a YouTube link to arm the transport.');
  readonly durationSeconds = signal(0);
  readonly currentSeconds = signal(0);
  readonly volume = signal(76);
  readonly isMuted = signal(false);
  readonly recentTracks = signal<readonly RecentTrack[]>([]);
  readonly selectedRecentUrl = signal('');
  readonly playlistVideoIds = signal<readonly string[]>([]);
  readonly currentPlaylistIndex = signal(-1);
  readonly resolvedPlaylistTitles = signal<Record<string, string>>({});

  readonly hasLoadedSource = computed(() => this.activeVideoId() !== null);
  readonly hasPlaylistLoaded = computed(() => !!this.activePlaylistId() && this.playlistVideoIds().length > 0);
  readonly progressPercent = computed(() =>
    this.durationSeconds() > 0 ? Math.min(100, (this.currentSeconds() / this.durationSeconds()) * 100) : 0,
  );
  readonly currentTimeLabel = computed(() => formatTime(this.currentSeconds()));
  readonly durationLabel = computed(() => formatTime(this.durationSeconds()));
  readonly playButtonLabel = computed(() => (this.status() === 'playing' ? 'Pause' : 'Play'));
  readonly loadButtonLabel = computed(() => (this.status() === 'loading' ? 'Loading...' : 'Load audio'));
  readonly sourceCode = computed(
    () => this.activeVideoId()?.slice(0, 8).toUpperCase() ?? this.activePlaylistId()?.slice(0, 8).toUpperCase() ?? 'Standby',
  );
  readonly statusLabel = computed(() => playerStatusLabel(this.status()));
  readonly detailLabel = computed(() => (this.hasLoadedSource() ? 'video hidden' : 'audio queue'));
  readonly leftMeterLevels = computed(() =>
    buildMeterLevels(this.currentSeconds(), this.volume(), this.status() === 'playing', 0.2),
  );
  readonly rightMeterLevels = computed(() =>
    buildMeterLevels(this.currentSeconds(), this.volume(), this.status() === 'playing', 1.15),
  );
  readonly leftReelRotation = computed(() => computeReelRotation(this.currentSeconds(), this.status(), 180));
  readonly rightReelRotation = computed(() => computeReelRotation(this.currentSeconds(), this.status(), -220));
  readonly upNextItems = computed<readonly UpNextItem[]>(() => {
    const ids = this.playlistVideoIds();
    if (ids.length === 0) {
      return [];
    }

    const currentIndex = this.currentPlaylistIndex();
    const startIndex = currentIndex >= 0 ? currentIndex : 0;
    return ids.slice(startIndex, Math.min(ids.length, startIndex + 6)).map((videoId, offset) => {
      const index = startIndex + offset;
      const recentTrack = this.recentTracks().find((item) => item.videoId === videoId);
      const resolvedTitle = this.resolvedPlaylistTitles()[videoId];
      const isCurrent = index === currentIndex;
      return {
        index,
        isCurrent,
        title: recentTrack?.title ?? resolvedTitle ?? `Video ${videoId.slice(0, 8).toUpperCase()}`,
        videoId,
      };
    });
  });

  constructor() {
    effect(
      () => {
        const playlistId = this.activePlaylistId();
        const playlistIds = this.playlistVideoIds();

        if (!playlistId || playlistIds.length === 0) {
          this.resetTitleQueueState();
          return;
        }

        this.queueMissingPlaylistTitles(playlistIds);
        this.scheduleInitialTitleBatch(playlistId);
        this.ensureRecurringTitleBatch();
      },
      { allowSignalWrites: true },
    );

    this.destroyRef.onDestroy(() => {
      this.stopPolling();
      this.resetTitleQueueState();
      this.pendingTitleRequests.forEach((controller) => controller.abort());
      this.pendingTitleRequests.clear();
      this.player?.destroy();
      this.player = null;
    });
  }

  updateUrl(value: string): void {
    this.urlInput.set(value);
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  async loadSource(): Promise<void> {
    const normalizedUrl = normalizeYouTubeInput(this.urlInput());
    const source = parseYouTubeSource(normalizedUrl);

    if (!source) {
      this.status.set('error');
      this.errorMessage.set('Paste a valid YouTube watch, share, embed, shorts, or playlist URL.');
      return;
    }

    this.urlInput.set(source.inputUrl);
    this.status.set('loading');
    this.errorMessage.set('');
    this.resetTitleQueueState();
    this.activeVideoId.set(null);
    this.activePlaylistId.set(null);
    this.playlistVideoIds.set([]);
    this.currentPlaylistIndex.set(-1);
    this.currentSeconds.set(0);
    this.durationSeconds.set(0);
    this.sourceTitle.set('Loading source');
    this.sourceAuthor.set('Connecting to YouTube iframe transport.');

    try {
      await ensureYouTubeIframeApi(this.document);
      await this.mountPlayer(source);
      this.activeVideoId.set(source.videoId);
      this.activePlaylistId.set(source.playlistId);
      this.selectedRecentUrl.set(source.inputUrl);
      this.syncPlayerSnapshot();
      this.status.set('ready');
    } catch (error) {
      this.stopPolling();
      this.player?.destroy();
      this.player = null;
      this.resetTitleQueueState();
      this.playlistVideoIds.set([]);
      this.currentPlaylistIndex.set(-1);
      this.status.set('error');
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Unable to load that YouTube source right now.',
      );
    }
  }

  async togglePlayback(): Promise<void> {
    if (!this.player) {
      await this.loadSource();
    }

    if (!this.player) {
      return;
    }

    if (this.status() === 'playing') {
      this.player.pauseVideo();
      return;
    }

    this.player.playVideo();
  }

  stopPlayback(): void {
    if (!this.player) {
      return;
    }

    this.player.stopVideo();
    this.currentSeconds.set(0);
    this.status.set('ready');
  }

  seekBy(seconds: number): void {
    if (!this.player) {
      return;
    }

    const duration = this.durationSeconds();
    const maxTime = duration > 0 ? duration : Math.max(0, this.currentSeconds());
    const nextTime = clampNumber(this.currentSeconds() + seconds, 0, maxTime);
    this.player.seekTo(nextTime, true);
    this.currentSeconds.set(nextTime);
  }

  seekToPercent(value: number): void {
    if (!this.player || this.durationSeconds() <= 0) {
      return;
    }

    const clampedPercent = clampNumber(value, 0, 100);
    const nextTime = (clampedPercent / 100) * this.durationSeconds();
    this.player.seekTo(nextTime, true);
    this.currentSeconds.set(nextTime);
  }

  updateVolume(value: number): void {
    const nextVolume = Math.round(clampNumber(value, 0, 100));
    this.volume.set(nextVolume);

    if (!this.player) {
      return;
    }

    this.player.setVolume(nextVolume);
    if (nextVolume === 0) {
      this.player.mute();
      this.isMuted.set(true);
      return;
    }

    if (this.player.isMuted()) {
      this.player.unMute();
    }

    this.isMuted.set(false);
  }

  toggleMute(): void {
    if (!this.player) {
      this.isMuted.update((value) => !value);
      return;
    }

    if (this.player.isMuted()) {
      this.player.unMute();
      this.isMuted.set(false);
      if (this.volume() === 0) {
        this.player.setVolume(48);
        this.volume.set(48);
      }
      return;
    }

    this.player.mute();
    this.isMuted.set(true);
  }

  selectRecentTrack(url: string): void {
    this.selectedRecentUrl.set(url);
    if (!url) {
      return;
    }

    this.updateUrl(url);
    void this.loadSource();
  }

  previousTrack(): void {
    if (!this.player || !this.hasPlaylistLoaded()) {
      return;
    }

    this.player.previousVideo();
  }

  nextTrack(): void {
    if (!this.player || !this.hasPlaylistLoaded()) {
      return;
    }

    this.player.nextVideo();
  }

  playPlaylistItem(index: number): void {
    if (!this.player || !this.hasPlaylistLoaded()) {
      return;
    }

    this.player.playVideoAt(index);
  }

  private async mountPlayer(source: YouTubeSource): Promise<void> {
    const host = this.playerHost().nativeElement;
    const origin = this.document.location?.origin;

    this.stopPolling();
    this.player?.destroy();
    this.player = null;
    host.innerHTML = '';

    await new Promise<void>((resolve, reject) => {
      const yt = window.YT;
      if (!yt?.Player) {
        reject(new Error('The YouTube iframe API did not finish loading.'));
        return;
      }

      let settled = false;

      const resolveOnce = (player: YouTubePlayer) => {
        if (settled) {
          return;
        }

        settled = true;
        this.player = player;
        this.player.setVolume(this.volume());
        if (this.isMuted()) {
          this.player.mute();
        }
        this.startPolling();
        resolve();
      };

      const rejectOnce = (message: string) => {
        if (settled) {
          return;
        }

        settled = true;
        reject(new Error(message));
      };

      this.player = new yt.Player(host, {
        height: '1',
        width: '1',
        ...(source.videoId ? { videoId: source.videoId } : {}),
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          ...(source.playlistId ? { list: source.playlistId, listType: 'playlist' } : {}),
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          ...(origin ? { origin } : {}),
        },
        events: {
          onReady: (event) => {
            resolveOnce(event.target);
            this.syncPlayerSnapshot();
          },
          onStateChange: (event) => {
            this.handlePlayerStateChange(event.data ?? -1);
            this.syncPlayerSnapshot();
          },
          onError: () => {
            rejectOnce('That video cannot be embedded for audio playback.');
          },
        },
      });
    });
  }

  private handlePlayerStateChange(state: number): void {
    const playerState = window.YT?.PlayerState;
    if (!playerState) {
      return;
    }

    switch (state) {
      case playerState.PLAYING:
        this.status.set('playing');
        break;
      case playerState.PAUSED:
        this.status.set('paused');
        break;
      case playerState.ENDED:
        this.status.set('ended');
        break;
      case playerState.BUFFERING:
        this.status.set('loading');
        break;
      case playerState.CUED:
      case playerState.UNSTARTED:
      default:
        if (this.activeVideoId() || this.player) {
          this.status.set('ready');
        }
        break;
    }
  }

  private syncPlayerSnapshot(): void {
    if (!this.player) {
      return;
    }

    const duration = this.player.getDuration();
    const currentTime = this.player.getCurrentTime();
    const videoData = this.player.getVideoData();
    const playlistIds = this.player.getPlaylist?.() ?? [];
    const playlistIndex = this.player.getPlaylistIndex?.() ?? -1;
    const currentVideoId = normalizeVideoId(videoData?.video_id ?? null) ?? this.activeVideoId();
    const previousVideoId = this.activeVideoId();

    this.durationSeconds.set(Number.isFinite(duration) ? duration : 0);
    this.currentSeconds.set(Number.isFinite(currentTime) ? currentTime : 0);
    this.isMuted.set(this.player.isMuted());
    const normalizedPlaylistIds = Array.isArray(playlistIds) ? playlistIds : [];
    if (!areStringArraysEqual(this.playlistVideoIds(), normalizedPlaylistIds)) {
      this.playlistVideoIds.set(normalizedPlaylistIds);
    }
    if (this.currentPlaylistIndex() !== playlistIndex && Number.isFinite(playlistIndex)) {
      this.currentPlaylistIndex.set(playlistIndex);
    }

    if (videoData?.title) {
      this.sourceTitle.set(videoData.title);
    }

    if (videoData?.author) {
      this.sourceAuthor.set(videoData.author);
    }

    if (currentVideoId && videoData?.title) {
      this.activeVideoId.set(currentVideoId);
      const track = {
        author: videoData.author || 'Unknown channel',
        title: videoData.title,
        url: buildWatchUrl(currentVideoId),
        videoId: currentVideoId,
      } satisfies RecentTrack;
      this.rememberTrack(track);
      this.selectedRecentUrl.set(track.url);
    }

    if (currentVideoId && previousVideoId && currentVideoId !== previousVideoId && this.activePlaylistId()) {
      this.queueMissingPlaylistTitles(this.playlistVideoIds());
      this.triggerTitleBatch(RECURRING_TITLE_BATCH_SIZE);
    }
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollHandle = window.setInterval(() => this.syncPlayerSnapshot(), PLAYER_POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollHandle === null) {
      return;
    }

    window.clearInterval(this.pollHandle);
    this.pollHandle = null;
  }

  private rememberTrack(track: RecentTrack): void {
    this.recentTracks.update((current) => {
      const withoutTrack = current.filter((item) => item.videoId !== track.videoId);
      return [track, ...withoutTrack].slice(0, MAX_RECENT_TRACKS);
    });
    this.resolvedPlaylistTitles.update((current) => ({ ...current, [track.videoId]: track.title }));
  }

  private queueMissingPlaylistTitles(videoIds: readonly string[]): void {
    const recentTrackIds = new Set(this.recentTracks().map((item) => item.videoId));
    const resolvedTitles = this.resolvedPlaylistTitles();

    videoIds.forEach((videoId) => {
      if (recentTrackIds.has(videoId) || resolvedTitles[videoId] || this.pendingTitleRequests.has(videoId)) {
        return;
      }

      this.queuedTitleIds.add(videoId);
    });
  }

  private scheduleInitialTitleBatch(playlistId: string): void {
    if (this.scheduledTitlePlaylistId === playlistId) {
      return;
    }

    if (this.titleBatchTimer !== null) {
      window.clearTimeout(this.titleBatchTimer);
    }

    this.scheduledTitlePlaylistId = playlistId;
    this.titleBatchTimer = window.setTimeout(() => {
      this.titleBatchTimer = null;
      this.triggerTitleBatch(INITIAL_TITLE_BATCH_SIZE);
    }, INITIAL_TITLE_BATCH_DELAY_MS);
  }

  private ensureRecurringTitleBatch(): void {
    if (this.titleRefillTimer !== null) {
      return;
    }

    this.titleRefillTimer = window.setInterval(() => {
      this.triggerTitleBatch(RECURRING_TITLE_BATCH_SIZE);
    }, TITLE_REFILL_INTERVAL_MS);
  }

  private triggerTitleBatch(limit: number): void {
    if (this.queuedTitleIds.size === 0 || !this.activePlaylistId()) {
      return;
    }

    if (this.titleQueueBusy) {
      this.deferredTitleBatchSize = Math.max(this.deferredTitleBatchSize, limit);
      return;
    }

    void this.processTitleQueue(limit);
  }

  private async processTitleQueue(limit: number): Promise<void> {
    const ids = Array.from(this.queuedTitleIds).slice(0, limit);
    if (ids.length === 0) {
      return;
    }

    this.titleQueueBusy = true;

    try {
      for (let index = 0; index < ids.length; index += 1) {
        const videoId = ids[index];
        this.queuedTitleIds.delete(videoId);
        await this.fetchPlaylistTitle(videoId);

        if (index < ids.length - 1) {
          await delay(TITLE_FETCH_STAGGER_MS);
        }
      }
    } finally {
      this.titleQueueBusy = false;

      if (this.deferredTitleBatchSize > 0 && this.queuedTitleIds.size > 0) {
        const nextBatch = this.deferredTitleBatchSize;
        this.deferredTitleBatchSize = 0;
        this.triggerTitleBatch(nextBatch);
      }
    }
  }

  private async fetchPlaylistTitle(videoId: string): Promise<void> {
    const controller = new AbortController();
    this.pendingTitleRequests.set(videoId, controller);

    try {
      const response = await fetch(buildOEmbedUrl(videoId), {
        signal: controller.signal,
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { title?: unknown };
      const resolvedTitle = typeof payload.title === 'string' ? payload.title.trim() : '';
      if (resolvedTitle) {
        this.resolvedPlaylistTitles.update((current) => ({ ...current, [videoId]: resolvedTitle }));
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        return;
      }
    } finally {
      this.pendingTitleRequests.delete(videoId);
    }
  }

  private resetTitleQueueState(): void {
    if (this.titleBatchTimer !== null) {
      window.clearTimeout(this.titleBatchTimer);
      this.titleBatchTimer = null;
    }

    if (this.titleRefillTimer !== null) {
      window.clearInterval(this.titleRefillTimer);
      this.titleRefillTimer = null;
    }

    this.pendingTitleRequests.forEach((controller) => controller.abort());
    this.pendingTitleRequests.clear();
    this.queuedTitleIds.clear();
    this.titleQueueBusy = false;
    this.deferredTitleBatchSize = 0;
    this.scheduledTitlePlaylistId = null;
  }
}

async function ensureYouTubeIframeApi(document: Document): Promise<void> {
  if (window.YT?.Player) {
    return;
  }

  if (youtubeIframeApiPromise) {
    return youtubeIframeApiPromise;
  }

  youtubeIframeApiPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-youtube-iframe-api="true"]');
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    if (existingScript) {
      existingScript.addEventListener('error', () => reject(new Error('Failed to load the YouTube iframe API.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.defer = true;
    script.dataset['youtubeIframeApi'] = 'true';
    script.onerror = () => reject(new Error('Failed to load the YouTube iframe API.'));
    document.head.appendChild(script);
  });

  return youtubeIframeApiPromise;
}

function parseYouTubeSource(input: string): YouTubeSource | null {
  if (!input) {
    return null;
  }

  const normalizedInput = normalizeYouTubeInput(input);
  const directMatch = normalizedInput.match(/^[a-zA-Z0-9_-]{11}$/);
  if (directMatch) {
    return {
      inputUrl: buildWatchUrl(directMatch[0]),
      kind: 'video',
      playlistId: null,
      videoId: directMatch[0],
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedInput);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, '');

  if (hostname === 'youtu.be') {
    const videoId = normalizeVideoId(parsed.pathname.slice(1));
    if (!videoId) {
      return null;
    }

    return {
      inputUrl: buildWatchUrl(videoId),
      kind: 'video',
      playlistId: null,
      videoId,
    };
  }

  if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'music.youtube.com') {
    const playlistId = normalizePlaylistId(parsed.searchParams.get('list'));

    if (parsed.pathname === '/playlist' && playlistId) {
      return {
        inputUrl: buildPlaylistUrl(playlistId),
        kind: 'playlist',
        playlistId,
        videoId: null,
      };
    }

    if (parsed.pathname === '/watch') {
      const videoId = normalizeVideoId(parsed.searchParams.get('v'));
      if (playlistId) {
        return {
          inputUrl: buildPlaylistUrl(playlistId, videoId),
          kind: 'playlist',
          playlistId,
          videoId,
        };
      }

      if (videoId) {
        return {
          inputUrl: buildWatchUrl(videoId),
          kind: 'video',
          playlistId: null,
          videoId,
        };
      }
    }

    if (parsed.pathname.startsWith('/shorts/')) {
      const videoId = normalizeVideoId(parsed.pathname.split('/')[2] ?? null);
      if (videoId) {
        return {
          inputUrl: buildWatchUrl(videoId),
          kind: 'video',
          playlistId: null,
          videoId,
        };
      }
    }

    if (parsed.pathname.startsWith('/embed/')) {
      const videoId = normalizeVideoId(parsed.pathname.split('/')[2] ?? null);
      if (videoId) {
        return {
          inputUrl: buildWatchUrl(videoId),
          kind: 'video',
          playlistId: null,
          videoId,
        };
      }
    }
  }

  return null;
}

function normalizeVideoId(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/[a-zA-Z0-9_-]{11}/);
  return match ? match[0] : null;
}

function buildWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function buildPlaylistUrl(playlistId: string, videoId?: string | null): string {
  const watchPrefix = videoId ? `watch?v=${videoId}&` : 'playlist?';
  return `https://www.youtube.com/${watchPrefix}list=${playlistId}`;
}

function buildOEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(buildWatchUrl(videoId))}&format=json`;
}

function areStringArraysEqual(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function normalizePlaylistId(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeYouTubeInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('www.') || trimmed.startsWith('youtube.com') || trimmed.startsWith('m.youtube.com') || trimmed.startsWith('music.youtube.com') || trimmed.startsWith('youtu.be')) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function formatTime(value: number): string {
  const totalSeconds = Math.max(0, Math.floor(value));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function playerStatusLabel(status: PlayerStatus): string {
  switch (status) {
    case 'playing':
      return 'Rolling';
    case 'paused':
      return 'Paused';
    case 'loading':
      return 'Buffering';
    case 'ended':
      return 'At end';
    case 'error':
      return 'Source error';
    case 'ready':
      return 'Cued';
    default:
      return 'Standby';
  }
}

function buildMeterLevels(currentSeconds: number, volume: number, isPlaying: boolean, phaseOffset: number): readonly number[] {
  if (!isPlaying || volume <= 0) {
    return Array.from({ length: METER_BAR_COUNT }, () => 12);
  }

  const baseIntensity = 24 + volume * 0.44;
  return Array.from({ length: METER_BAR_COUNT }, (_, index) => {
    const pulse = Math.sin(currentSeconds * 3.4 + index * 0.55 + phaseOffset);
    const shimmer = Math.cos(currentSeconds * 6.2 + index * 0.3 + phaseOffset);
    const combined = baseIntensity + pulse * 18 + shimmer * 9 - index * 2.6;
    return clampNumber(Math.round(combined), 10, 100);
  });
}

function computeReelRotation(currentSeconds: number, status: PlayerStatus, direction: number): number {
  const multiplier = status === 'playing' ? 72 : 10;
  return currentSeconds * multiplier + direction;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
