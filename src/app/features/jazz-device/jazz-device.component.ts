import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { DeviceDialComponent } from './components/device-dial.component';
import { DeviceDisplayComponent } from './components/device-display.component';
import { ReelControlComponent } from './components/reel-control.component';
import { TransportControlsComponent } from './components/transport-controls.component';
import {
  ChordEvent,
  DrumEvent,
  GeneratedTake,
  GenerationParameters,
  NoteEvent,
  PartId,
  PartLevels,
  SectionId,
} from './models/jazz-device.types';
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

interface SequenceSectionMarker {
  readonly id: SectionId;
  readonly label: string;
  readonly startPercent: number;
  readonly widthPercent: number;
}

interface SequenceBarMarker {
  readonly label: string;
  readonly positionPercent: number;
}

interface SequenceEventChip {
  readonly index: number;
  readonly beat: number;
  readonly durationBeats: number;
  readonly label: string;
  readonly detail: string;
  readonly accent: number;
}

type SequenceLaneKind = 'chord' | 'note' | 'drum';

interface SequenceLane {
  readonly id: PartId;
  readonly label: string;
  readonly kind: SequenceLaneKind;
  readonly color: string;
  readonly isPiano: boolean;
  readonly hasEvents: boolean;
  readonly eventCount: number;
  readonly events: readonly SequenceEventChip[];
}

interface SelectedSequenceEventRef {
  readonly partId: PartId;
  readonly index: number;
}

interface SelectedSequenceEventData {
  readonly partId: PartId;
  readonly partLabel: string;
  readonly kind: SequenceLaneKind;
  readonly index: number;
  readonly color: string;
  readonly event: ChordEvent | NoteEvent | DrumEvent;
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
  readonly sequenceSections = computed<readonly SequenceSectionMarker[]>(() => {
    const take = this.currentTake();
    if (!take) {
      return [];
    }

    return take.sections.map((section) => ({
      id: section.id,
      label: section.label,
      startPercent: (section.startBar / take.totalBars) * 100,
      widthPercent: (section.bars / take.totalBars) * 100,
    }));
  });
  readonly sequenceBarMarkers = computed<readonly SequenceBarMarker[]>(() => {
    const take = this.currentTake();
    if (!take) {
      return [];
    }

    return Array.from({ length: take.totalBars + 1 }, (_, index) => ({
      label: index === take.totalBars ? '' : `${index + 1}`,
      positionPercent: (index / take.totalBars) * 100,
    }));
  });
  readonly sequenceLanes = computed<readonly SequenceLane[]>(() => buildSequenceLanes(this.currentTake(), this.parameters()));
  readonly playheadPercent = computed(() => this.telemetry().progress * 100);
  readonly selectedSequenceEventRef = signal<SelectedSequenceEventRef | null>(null);
  readonly selectedSequenceEvent = computed<SelectedSequenceEventData | null>(() =>
    getSelectedSequenceEventData(this.currentTake(), this.sequenceLanes(), this.selectedSequenceEventRef()),
  );

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

  powerOff(): void {
    this.audioEngine.powerOff();
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

  seekSequence(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }

    const progress = (event.clientX - rect.left) / rect.width;
    this.seek(Math.max(0, Math.min(1, progress)));
  }

  selectSequenceEvent(event: MouseEvent, partId: PartId, index: number): void {
    event.stopPropagation();
    this.selectedSequenceEventRef.set({ partId, index });
  }

  isSelectedSequenceEvent(partId: PartId, index: number): boolean {
    const selected = this.selectedSequenceEventRef();
    return selected?.partId === partId && selected.index === index;
  }

  addSequenceEvent(partId: PartId): void {
    const take = this.currentTake();
    if (!take) {
      return;
    }

    const totalBeats = take.totalBars * 4;
    const beat = snapBeat(this.telemetry().progress * totalBeats);
    const nextEvent = createDefaultPartEvent(partId, beat);
    const nextEvents = sortPartEvents(partId, [...getPartEvents(take, partId), nextEvent]);
    const nextIndex = findMatchingEventIndex(partId, nextEvents, nextEvent);

    this.selectedSequenceEventRef.set({ partId, index: nextIndex });
    this.commitTake(replacePartEvents(take, partId, nextEvents));
  }

  duplicateSelectedSequenceEvent(): void {
    const selected = this.selectedSequenceEvent();
    const take = this.currentTake();
    if (!selected || !take) {
      return;
    }

    const duplicated = duplicatePartEvent(selected.partId, selected.event, take.totalBars * 4);
    const nextEvents = sortPartEvents(selected.partId, [...getPartEvents(take, selected.partId), duplicated]);
    const nextIndex = findMatchingEventIndex(selected.partId, nextEvents, duplicated);

    this.selectedSequenceEventRef.set({ partId: selected.partId, index: nextIndex });
    this.commitTake(replacePartEvents(take, selected.partId, nextEvents));
  }

  deleteSelectedSequenceEvent(): void {
    const selected = this.selectedSequenceEvent();
    const take = this.currentTake();
    if (!selected || !take) {
      return;
    }

    const nextEvents = getPartEvents(take, selected.partId).filter((_, index) => index !== selected.index);
    this.selectedSequenceEventRef.set(null);
    this.commitTake(replacePartEvents(take, selected.partId, nextEvents));
  }

  selectedChordMidiValue(): string {
    const selected = this.selectedSequenceEvent();
    if (!selected || selected.kind !== 'chord') {
      return '';
    }

    return (selected.event as ChordEvent).midi.join(', ');
  }

  updateSelectedBeat(value: number): void {
    this.patchSelectedEvent((partId, event, totalBeats) => ({
      ...event,
      beat: clampNumber(snapBeat(value), 0, Math.max(0, totalBeats - 0.25)),
    }));
  }

  updateSelectedDuration(value: number): void {
    this.patchSelectedEvent((_, event) => ({
      ...event,
      durationBeats: clampNumber(snapBeat(value), 0.25, 8),
    }));
  }

  updateSelectedVelocity(value: number): void {
    this.patchSelectedEvent((_, event) => ({
      ...event,
      velocity: clampNumber(value, 0.05, 1),
    }));
  }

  updateSelectedChordSymbol(value: string): void {
    this.patchSelectedEvent((partId, event) =>
      isChordPart(partId)
        ? {
            ...(event as ChordEvent),
            symbol: value.trim() || (event as ChordEvent).symbol,
          }
        : event,
    );
  }

  updateSelectedChordMidi(value: string): void {
    const parsed = parseMidiList(value);
    if (parsed.length === 0) {
      return;
    }

    this.patchSelectedEvent((partId, event) =>
      isChordPart(partId)
        ? {
            ...(event as ChordEvent),
            midi: parsed,
          }
        : event,
    );
  }

  updateSelectedMidi(value: number): void {
    this.patchSelectedEvent((partId, event) =>
      partId === 'bass' || partId === 'lead'
        ? {
            ...(event as NoteEvent),
            midi: clampMidi(value),
          }
        : event,
    );
  }

  updateSelectedSlide(value: number): void {
    this.patchSelectedEvent((partId, event) =>
      partId === 'bass' || partId === 'lead'
        ? {
            ...(event as NoteEvent),
            slide: clampNumber(value, 0, 0.3),
          }
        : event,
    );
  }

  updateSelectedInstrument(value: DrumEvent['instrument']): void {
    this.patchSelectedEvent((partId, event) =>
      partId === 'drums'
        ? {
            ...(event as DrumEvent),
            instrument: value,
          }
        : event,
    );
  }

  sequenceEventLeft(event: SequenceEventChip): string {
    const take = this.currentTake();
    if (!take) {
      return '0%';
    }

    return `${(event.beat / (take.totalBars * 4)) * 100}%`;
  }

  sequenceEventWidth(event: SequenceEventChip): string {
    const take = this.currentTake();
    if (!take) {
      return '0%';
    }

    return `${Math.max(2.2, (event.durationBeats / (take.totalBars * 4)) * 100)}%`;
  }

  sequenceEventOpacity(event: SequenceEventChip): number {
    return Math.max(0.5, Math.min(1, event.accent));
  }

  partLevelLabel(partId: PartId): string {
    return percentLabel(this.partLevels()[partId]);
  }

  updatePartLevel(partId: PartId, value: number): void {
    const level = Math.max(0, Math.min(1, value));
    this.partLevels.update((current) => ({ ...current, [partId]: level }));
    this.audioEngine.setPartVolume(partId, level);
  }

  isPianoSequencingEnabled(partId: PartId): boolean {
    return this.parameters().pianoSequencing[partId];
  }

  togglePianoSequencing(partId: PartId): void {
    this.parameters.update((current) => ({
      ...current,
      pianoSequencing: {
        ...current.pianoSequencing,
        [partId]: !current.pianoSequencing[partId],
      },
    }));

    this.scheduleRegeneration(this.transportState() === 'playing');
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

  private patchSelectedEvent(
    update: (
      partId: PartId,
      event: ChordEvent | NoteEvent | DrumEvent,
      totalBeats: number,
    ) => ChordEvent | NoteEvent | DrumEvent,
  ): void {
    const selected = this.selectedSequenceEvent();
    const take = this.currentTake();
    if (!selected || !take) {
      return;
    }

    const totalBeats = take.totalBars * 4;
    const nextEvent = clampPartEvent(selected.partId, update(selected.partId, selected.event, totalBeats), totalBeats);
    const currentEvents = getPartEvents(take, selected.partId).map((event, index) =>
      index === selected.index ? nextEvent : event,
    );
    const nextEvents = sortPartEvents(selected.partId, currentEvents);
    const nextIndex = findMatchingEventIndex(selected.partId, nextEvents, nextEvent);

    this.selectedSequenceEventRef.set({ partId: selected.partId, index: nextIndex });
    this.commitTake(replacePartEvents(take, selected.partId, nextEvents));
  }

  private commitTake(take: GeneratedTake): void {
    this.audioEngine.updateTake(take, this.shouldPreservePlaybackPosition());
  }

  private shouldPreservePlaybackPosition(): boolean {
    const state = this.transportState();
    return state === 'playing' || state === 'paused';
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

function buildSequenceLanes(
  take: GeneratedTake | null,
  parameters: GenerationParameters,
): readonly SequenceLane[] {
  if (!take) {
    return [];
  }

  return [
    buildChordLane('rhodes', 'Rhodes', '#39556c', take.chords, parameters),
    buildChordLane('pad', 'Pad', '#7a6b8f', take.pad, parameters),
    buildChordLane('comp', 'Comp', '#8b5d46', take.comp, parameters),
    buildNoteLane('bass', 'Bass', '#3f684d', take.bass, parameters),
    buildNoteLane('lead', 'Lead', '#8a4d4d', take.lead, parameters),
    buildDrumLane('drums', 'Drums', '#5f5f68', take.drums, parameters),
  ].filter((lane) => lane.isPiano);
}

function buildChordLane(
  id: PartId,
  label: string,
  color: string,
  events: readonly ChordEvent[],
  parameters: GenerationParameters,
): SequenceLane {
  return {
    id,
    label,
    kind: 'chord',
    color,
    isPiano: parameters.pianoSequencing[id],
    hasEvents: events.length > 0,
    eventCount: events.length,
    events: events.map((event, index) => ({
      index,
      beat: event.beat,
      durationBeats: event.durationBeats,
      label: event.symbol,
      detail: `${event.midi.length} notes`,
      accent: 0.55 + event.velocity,
    })),
  };
}

function buildNoteLane(
  id: PartId,
  label: string,
  color: string,
  events: readonly NoteEvent[],
  parameters: GenerationParameters,
): SequenceLane {
  return {
    id,
    label,
    kind: 'note',
    color,
    isPiano: parameters.pianoSequencing[id],
    hasEvents: events.length > 0,
    eventCount: events.length,
    events: events.map((event, index) => ({
      index,
      beat: event.beat,
      durationBeats: event.durationBeats,
      label: midiToShortNote(event.midi),
      detail: `${Math.round(event.velocity * 100)}%`,
      accent: 0.48 + event.velocity,
    })),
  };
}

function buildDrumLane(
  id: PartId,
  label: string,
  color: string,
  events: readonly DrumEvent[],
  parameters: GenerationParameters,
): SequenceLane {
  return {
    id,
    label,
    kind: 'drum',
    color,
    isPiano: parameters.pianoSequencing[id],
    hasEvents: events.length > 0,
    eventCount: events.length,
    events: events.map((event, index) => ({
      index,
      beat: event.beat,
      durationBeats: event.durationBeats,
      label: drumLabel(event.instrument),
      detail: `${Math.round(event.velocity * 100)}%`,
      accent: 0.52 + event.velocity,
    })),
  };
}

function drumLabel(instrument: DrumEvent['instrument']): string {
  switch (instrument) {
    case 'kick':
      return 'Kick';
    case 'snare':
      return 'Snr';
    case 'open-hat':
      return 'Open';
    default:
      return 'Hat';
  }
}

function midiToShortNote(midi: number): string {
  const note = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function getSelectedSequenceEventData(
  take: GeneratedTake | null,
  lanes: readonly SequenceLane[],
  selected: SelectedSequenceEventRef | null,
): SelectedSequenceEventData | null {
  if (!take || !selected) {
    return null;
  }

  const lane = lanes.find((item) => item.id === selected.partId);
  const events = getPartEvents(take, selected.partId);
  const event = events[selected.index];
  if (!lane || !event) {
    return null;
  }

  return {
    partId: selected.partId,
    partLabel: lane.label,
    kind: lane.kind,
    index: selected.index,
    color: lane.color,
    event,
  };
}

function getPartEvents(
  take: GeneratedTake,
  partId: PartId,
): readonly (ChordEvent | NoteEvent | DrumEvent)[] {
  switch (partId) {
    case 'rhodes':
      return take.chords;
    case 'pad':
      return take.pad;
    case 'comp':
      return take.comp;
    case 'bass':
      return take.bass;
    case 'lead':
      return take.lead;
    default:
      return take.drums;
  }
}

function replacePartEvents(
  take: GeneratedTake,
  partId: PartId,
  events: readonly (ChordEvent | NoteEvent | DrumEvent)[],
): GeneratedTake {
  switch (partId) {
    case 'rhodes':
      return { ...take, chords: events as readonly ChordEvent[] };
    case 'pad':
      return { ...take, pad: events as readonly ChordEvent[] };
    case 'comp':
      return { ...take, comp: events as readonly ChordEvent[] };
    case 'bass':
      return { ...take, bass: events as readonly NoteEvent[] };
    case 'lead':
      return { ...take, lead: events as readonly NoteEvent[] };
    default:
      return { ...take, drums: events as readonly DrumEvent[] };
  }
}

function createDefaultPartEvent(partId: PartId, beat: number): ChordEvent | NoteEvent | DrumEvent {
  switch (partId) {
    case 'rhodes':
    case 'pad':
    case 'comp':
      return {
        beat,
        durationBeats: 1,
        midi: partId === 'pad' ? [60, 64, 67, 71] : [48, 52, 55, 59],
        velocity: 0.48,
        pan: 0,
        symbol: 'edit',
      };
    case 'bass':
      return {
        beat,
        durationBeats: 1,
        midi: 36,
        velocity: 0.52,
        slide: 0.04,
        pan: -0.05,
      };
    case 'lead':
      return {
        beat,
        durationBeats: 0.75,
        midi: 67,
        velocity: 0.54,
        slide: 0.06,
        pan: 0.05,
      };
    default:
      return {
        beat,
        durationBeats: 0.25,
        velocity: 0.6,
        instrument: 'hat',
        pan: 0,
      };
  }
}

function duplicatePartEvent(
  partId: PartId,
  event: ChordEvent | NoteEvent | DrumEvent,
  totalBeats: number,
): ChordEvent | NoteEvent | DrumEvent {
  const offsetBeat = clampNumber(event.beat + Math.max(0.25, event.durationBeats), 0, Math.max(0, totalBeats - 0.25));
  return clampPartEvent(partId, { ...event, beat: snapBeat(offsetBeat) }, totalBeats);
}

function clampPartEvent(
  partId: PartId,
  event: ChordEvent | NoteEvent | DrumEvent,
  totalBeats: number,
): ChordEvent | NoteEvent | DrumEvent {
  const beat = clampNumber(snapBeat(event.beat), 0, Math.max(0, totalBeats - 0.25));
  const durationBeats = clampNumber(snapBeat(event.durationBeats), 0.25, 8);
  const velocity = clampNumber(event.velocity, 0.05, 1);

  if (isChordPart(partId)) {
    const chord = event as ChordEvent;
    return {
      ...chord,
      beat,
      durationBeats,
      velocity,
      midi: normalizeMidiList(chord.midi),
      symbol: chord.symbol.trim() || 'edit',
    };
  }

  if (partId === 'bass' || partId === 'lead') {
    const note = event as NoteEvent;
    return {
      ...note,
      beat,
      durationBeats,
      velocity,
      midi: clampMidi(note.midi),
      slide: clampNumber(note.slide, 0, 0.3),
    };
  }

  const drum = event as DrumEvent;
  return {
    ...drum,
    beat,
    durationBeats,
    velocity,
  };
}

function sortPartEvents(
  partId: PartId,
  events: readonly (ChordEvent | NoteEvent | DrumEvent)[],
): readonly (ChordEvent | NoteEvent | DrumEvent)[] {
  return [...events].sort((left, right) => comparePartEvents(partId, left, right));
}

function comparePartEvents(
  partId: PartId,
  left: ChordEvent | NoteEvent | DrumEvent,
  right: ChordEvent | NoteEvent | DrumEvent,
): number {
  if (left.beat !== right.beat) {
    return left.beat - right.beat;
  }

  if (left.durationBeats !== right.durationBeats) {
    return left.durationBeats - right.durationBeats;
  }

  if (isChordPart(partId)) {
    return (left as ChordEvent).symbol.localeCompare((right as ChordEvent).symbol);
  }

  if (partId === 'drums') {
    return (left as DrumEvent).instrument.localeCompare((right as DrumEvent).instrument);
  }

  return (left as NoteEvent).midi - (right as NoteEvent).midi;
}

function findMatchingEventIndex(
  partId: PartId,
  events: readonly (ChordEvent | NoteEvent | DrumEvent)[],
  target: ChordEvent | NoteEvent | DrumEvent,
): number {
  const index = events.findIndex((event) => arePartEventsEqual(partId, event, target));
  return index === -1 ? 0 : index;
}

function arePartEventsEqual(
  partId: PartId,
  left: ChordEvent | NoteEvent | DrumEvent,
  right: ChordEvent | NoteEvent | DrumEvent,
): boolean {
  if (
    left.beat !== right.beat ||
    left.durationBeats !== right.durationBeats ||
    left.velocity !== right.velocity
  ) {
    return false;
  }

  if (isChordPart(partId)) {
    const leftChord = left as ChordEvent;
    const rightChord = right as ChordEvent;
    return leftChord.symbol === rightChord.symbol && leftChord.midi.join(',') === rightChord.midi.join(',');
  }

  if (partId === 'drums') {
    return (left as DrumEvent).instrument === (right as DrumEvent).instrument;
  }

  const leftNote = left as NoteEvent;
  const rightNote = right as NoteEvent;
  return leftNote.midi === rightNote.midi && leftNote.slide === rightNote.slide;
}

function isChordPart(partId: PartId): partId is 'rhodes' | 'pad' | 'comp' {
  return partId === 'rhodes' || partId === 'pad' || partId === 'comp';
}

function parseMidiList(value: string): readonly number[] {
  return normalizeMidiList(
    value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item)),
  );
}

function normalizeMidiList(values: readonly number[]): readonly number[] {
  const normalized = [...new Set(values.map((value) => clampMidi(value)))].sort((left, right) => left - right);
  return normalized.length > 0 ? normalized : [48, 52, 55];
}

function snapBeat(value: number): number {
  return Math.round(value * 4) / 4;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampMidi(value: number): number {
  return Math.round(clampNumber(value, 24, 96));
}
