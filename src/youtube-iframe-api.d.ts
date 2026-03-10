interface YouTubePlayerOptions {
  height?: string;
  width?: string;
  videoId?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerEvent) => void;
  };
}

interface YouTubePlayerEvent {
  data?: number;
  target: YouTubePlayer;
}

interface YouTubeVideoData {
  author: string;
  title: string;
  video_id: string;
}

interface YouTubePlayer {
  cuePlaylist(playlist: string | string[]): void;
  cueVideoById(videoId: string): void;
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlaylist(): string[];
  getPlaylistIndex(): number;
  getPlayerState(): number;
  getVideoData(): YouTubeVideoData;
  loadPlaylist(playlist: string | string[]): void;
  isMuted(): boolean;
  mute(): void;
  nextVideo(): void;
  pauseVideo(): void;
  playVideo(): void;
  playVideoAt(index: number): void;
  previousVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  stopVideo(): void;
  unMute(): void;
}

interface YouTubeNamespace {
  Player: new (elementId: string | HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: {
    BUFFERING: 3;
    CUED: 5;
    ENDED: 0;
    PAUSED: 2;
    PLAYING: 1;
    UNSTARTED: -1;
  };
}

interface Window {
  YT?: YouTubeNamespace;
  onYouTubeIframeAPIReady?: (() => void) | null;
}
