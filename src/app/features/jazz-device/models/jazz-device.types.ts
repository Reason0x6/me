export type DeviceTransportState =
  | 'idle'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'generating'
  | 'error';

export type LeadFocus = 'woodwind' | 'muted-trumpet' | 'guitar-led';
export type OctaveRange = 'low' | 'mid' | 'high';

export type SceneIntensity = 'nightfall' | 'lounge' | 'after-hours';

export type MusicalKey =
  | 'C'
  | 'Db'
  | 'D'
  | 'Eb'
  | 'E'
  | 'F'
  | 'Gb'
  | 'G'
  | 'Ab'
  | 'A'
  | 'Bb'
  | 'B';

export type SectionId = 'intro' | 'groove' | 'head' | 'solo' | 'outro';

export type DrumInstrument = 'kick' | 'snare' | 'hat' | 'open-hat';

export type PartId = 'rhodes' | 'pad' | 'comp' | 'bass' | 'lead' | 'drums';
export type SectionPartSelection = Record<PartId, boolean>;
export type ArrangementSelection = Record<SectionId, SectionPartSelection>;

export interface GenerationParameters {
  readonly seed: number;
  readonly freezeSeed: boolean;
  readonly bpm: number;
  readonly key: MusicalKey;
  readonly loopBars: number;
  readonly warmth: number;
  readonly swing: number;
  readonly pocket: number;
  readonly chordRichness: number;
  readonly drumDensity: number;
  readonly bassActivity: number;
  readonly leadAmount: number;
  readonly ambience: number;
  readonly focus: LeadFocus;
  readonly octaveRange: OctaveRange;
  readonly scene: SceneIntensity;
  readonly arrangement: ArrangementSelection;
}

export interface ArrangementSection {
  readonly id: SectionId;
  readonly label: string;
  readonly startBar: number;
  readonly bars: number;
  readonly intensity: number;
  readonly activeParts: readonly string[];
}

export interface ChordEvent {
  readonly beat: number;
  readonly durationBeats: number;
  readonly midi: readonly number[];
  readonly velocity: number;
  readonly pan: number;
  readonly symbol: string;
}

export interface NoteEvent {
  readonly beat: number;
  readonly durationBeats: number;
  readonly midi: number;
  readonly velocity: number;
  readonly slide: number;
  readonly pan: number;
}

export interface DrumEvent {
  readonly beat: number;
  readonly durationBeats: number;
  readonly velocity: number;
  readonly instrument: DrumInstrument;
  readonly pan: number;
}

export interface GeneratedTake {
  readonly seed: number;
  readonly totalBars: number;
  readonly bpm: number;
  readonly key: MusicalKey;
  readonly mode: 'major' | 'minor';
  readonly sections: readonly ArrangementSection[];
  readonly chords: readonly ChordEvent[];
  readonly pad: readonly ChordEvent[];
  readonly comp: readonly ChordEvent[];
  readonly bass: readonly NoteEvent[];
  readonly lead: readonly NoteEvent[];
  readonly drums: readonly DrumEvent[];
}

export interface DeviceTelemetry {
  readonly enabled: boolean;
  readonly state: DeviceTransportState;
  readonly elapsedSeconds: number;
  readonly progress: number;
  readonly sectionLabel: string;
  readonly activeParts: readonly string[];
  readonly meterLeft: number;
  readonly meterRight: number;
}

export interface DialOption<T extends string | number> {
  readonly label: string;
  readonly value: T;
}

export type PartLevels = Record<PartId, number>;
