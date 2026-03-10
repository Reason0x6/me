import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { DeviceDialComponent } from './components/device-dial.component';
import { DeviceDisplayComponent } from './components/device-display.component';
import { ReelControlComponent } from './components/reel-control.component';
import { TransportControlsComponent } from './components/transport-controls.component';
import { GenerationParameters, PartId, PartLevels, SectionId } from './models/jazz-device.types';
import { JazzAudioEngineService } from './services/jazz-audio-engine.service';
import { JazzPresetsService } from './services/jazz-presets.service';

interface PartLevelControl {
  readonly id: PartId;
  readonly label: string;
}

interface SectionControl {
  readonly id: SectionId;
  readonly label: string;
}

@Component({
  selector: 'app-jazz-device',
  standalone: true,
  imports: [
    CommonModule,
    DeviceDialComponent,
    DeviceDisplayComponent,
    FormsModule,
    ReelControlComponent,
    RouterLink,
    TransportControlsComponent,
  ],
  templateUrl: './jazz-device.component.html',
  styleUrl: './jazz-device.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JazzDeviceComponent {
  private readonly audioEngine = inject(JazzAudioEngineService);
  readonly presets = inject(JazzPresetsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly parameters = signal<GenerationParameters>(this.presets.createDefaultParameters());
  readonly partLevels = signal<PartLevels>(this.presets.createDefaultPartLevels());
  readonly partLevelControls: readonly PartLevelControl[] = [
    { id: 'rhodes', label: 'Rhodes' },
    { id: 'pad', label: 'Pad' },
    { id: 'comp', label: 'Comp' },
    { id: 'bass', label: 'Bass' },
    { id: 'lead', label: 'Lead' },
    { id: 'drums', label: 'Drums' },
  ];
  readonly sectionControls: readonly SectionControl[] = [
    { id: 'intro', label: 'Intro' },
    { id: 'groove', label: 'Groove' },
    { id: 'head', label: 'Head' },
    { id: 'solo', label: 'Solo' },
    { id: 'outro', label: 'Outro' },
  ];

  readonly telemetry = toSignal(this.audioEngine.telemetry$, {
    initialValue: {
      enabled: false,
      state: 'idle',
      elapsedSeconds: 0,
      progress: 0,
      sectionLabel: 'Idle',
      activeParts: [],
      meterLeft: 0,
      meterRight: 0,
    },
  });
  readonly transportState = toSignal(this.audioEngine.state$, { initialValue: 'idle' });
  readonly currentTake = toSignal(this.audioEngine.take$, { initialValue: null });

  readonly elapsedLabel = computed(() => formatSeconds(this.telemetry().elapsedSeconds));
  readonly seedLabel = computed(() => this.parameters().seed.toString().padStart(5, '0'));
  readonly ambienceLabel = computed(() => percentLabel(this.parameters().ambience));
  readonly warmthLabel = computed(() => percentLabel(this.parameters().warmth));
  readonly swingLabel = computed(() => percentLabel(this.parameters().swing));
  readonly pocketLabel = computed(() => percentLabel(this.parameters().pocket));
  readonly richnessLabel = computed(() => percentLabel(this.parameters().chordRichness));
  readonly densityLabel = computed(() => percentLabel(this.parameters().drumDensity));
  readonly bassLabel = computed(() => percentLabel(this.parameters().bassActivity));
  readonly leadLabel = computed(() => percentLabel(this.parameters().leadAmount));
  readonly meterBars = computed(() => [
    Math.max(8, this.telemetry().meterLeft * 100),
    Math.max(8, this.telemetry().meterRight * 100),
  ]);

  private regenerateTimer: number | null = null;

  constructor() {
    this.audioEngine.setPartVolumes(this.partLevels());

    this.destroyRef.onDestroy(() => {
      if (this.regenerateTimer !== null) {
        window.clearTimeout(this.regenerateTimer);
      }
    });
  }

  async initializeAudio(): Promise<void> {
    await this.audioEngine.initializeAudio();
    if (!this.currentTake()) {
      await this.audioEngine.generateTake(this.parameters(), false);
    }
  }

  async generateNewTake(): Promise<void> {
    const nextSeed = this.parameters().freezeSeed ? this.parameters().seed : generateSeed();
    const updated = { ...this.parameters(), seed: nextSeed };
    this.parameters.set(updated);
    await this.audioEngine.generateTake(updated, this.transportState() === 'playing');
  }

  play(): void {
    this.audioEngine.play();
  }

  pause(): void {
    this.audioEngine.pause();
  }

  stop(): void {
    this.audioEngine.stop();
  }

  updateSeed(seed: number): void {
    this.parameters.update((current) => ({ ...current, seed: Math.max(1, Math.floor(seed || 1)) }));
    this.scheduleRegeneration(false);
  }

  updateToggle<K extends keyof GenerationParameters>(key: K, value: GenerationParameters[K]): void {
    this.parameters.update((current) => ({ ...current, [key]: value }));
  }

  updateNumber<K extends keyof GenerationParameters>(
    key: K,
    value: GenerationParameters[K],
    regenerate = true,
  ): void {
    this.parameters.update((current) => ({ ...current, [key]: value }));

    if (key === 'bpm') {
      this.audioEngine.setBpm(Number(value));
    }

    if (regenerate) {
      this.scheduleRegeneration(this.transportState() === 'playing');
    }
  }

  seek(progress: number): void {
    this.audioEngine.seekToProgress(progress);
  }

  partLevelLabel(partId: PartId): string {
    return percentLabel(this.partLevels()[partId]);
  }

  updatePartLevel(partId: PartId, value: number): void {
    const level = Math.max(0, Math.min(1, value));
    this.partLevels.update((current) => ({ ...current, [partId]: level }));
    this.audioEngine.setPartVolume(partId, level);
  }

  isSectionPartEnabled(sectionId: SectionId, partId: PartId): boolean {
    return this.parameters().arrangement[sectionId][partId];
  }

  toggleSectionPart(sectionId: SectionId, partId: PartId): void {
    this.parameters.update((current) => ({
      ...current,
      arrangement: {
        ...current.arrangement,
        [sectionId]: {
          ...current.arrangement[sectionId],
          [partId]: !current.arrangement[sectionId][partId],
        },
      },
    }));

    this.scheduleRegeneration(this.transportState() === 'playing');
  }

  private scheduleRegeneration(preservePlayback: boolean): void {
    if (!this.currentTake()) {
      return;
    }

    if (this.regenerateTimer !== null) {
      window.clearTimeout(this.regenerateTimer);
    }

    this.regenerateTimer = window.setTimeout(() => {
      void this.audioEngine.generateTake(this.parameters(), preservePlayback);
    }, 220);
  }
}

function percentLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatSeconds(value: number): string {
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function generateSeed(): number {
  return Math.floor(Date.now() % 100000) + 1000;
}
