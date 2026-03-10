import { Injectable } from '@angular/core';

import {
  ArrangementSelection,
  ArrangementSection,
  ChordEvent,
  DrumEvent,
  GenerationParameters,
  GeneratedTake,
  MusicalKey,
  NoteEvent,
  PartId,
  SceneIntensity,
  SectionId,
} from '../models/jazz-device.types';

type Mode = 'major' | 'minor';
type ChordQuality = 'maj9' | 'maj13' | 'm9' | 'm11' | '13' | 'sus13';

interface ProgressionStep {
  readonly degree: number;
  readonly quality: ChordQuality;
}

interface SceneProfile {
  readonly minorBias: number;
  readonly sectionWeights: Record<SectionId, number>;
  readonly intensityOffset: number;
  readonly padSpacing: number;
  readonly padLengthMultiplier: number;
  readonly compBias: number;
  readonly bassBias: number;
  readonly leadBias: number;
  readonly drumBias: number;
  readonly pocketLag: number;
}

interface FocusProfile {
  readonly baseRegister: number;
  readonly compBias: number;
  readonly phraseBias: number;
  readonly pan: number;
  readonly slideBias: number;
  readonly paletteOffsets: readonly number[];
  readonly phraseStarts: readonly number[];
  readonly durationOptions: readonly number[];
}

const KEY_TO_SEMITONE: Record<MusicalKey, number> = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11,
};

const SEMITONE_TO_NOTE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const;
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10] as const;

const MAJOR_PROGRESSIONS: readonly ProgressionStep[][] = [
  [
    { degree: 1, quality: 'maj9' },
    { degree: 6, quality: 'm9' },
    { degree: 2, quality: 'm11' },
    { degree: 5, quality: '13' },
  ],
  [
    { degree: 4, quality: 'maj13' },
    { degree: 3, quality: 'm9' },
    { degree: 6, quality: 'm11' },
    { degree: 2, quality: 'sus13' },
  ],
  [
    { degree: 1, quality: 'maj13' },
    { degree: 5, quality: '13' },
    { degree: 6, quality: 'm9' },
    { degree: 2, quality: 'm11' },
  ],
];

const MINOR_PROGRESSIONS: readonly ProgressionStep[][] = [
  [
    { degree: 1, quality: 'm9' },
    { degree: 6, quality: 'maj9' },
    { degree: 2, quality: 'm11' },
    { degree: 5, quality: 'sus13' },
  ],
  [
    { degree: 1, quality: 'm11' },
    { degree: 4, quality: 'm9' },
    { degree: 7, quality: 'maj9' },
    { degree: 3, quality: '13' },
  ],
  [
    { degree: 6, quality: 'maj9' },
    { degree: 7, quality: '13' },
    { degree: 1, quality: 'm9' },
    { degree: 5, quality: 'sus13' },
  ],
];

@Injectable({ providedIn: 'root' })
export class JazzGeneratorService {
  normalizeParameters(params: GenerationParameters): GenerationParameters {
    const nearestLoop = [8, 12, 16, 24].reduce((closest, value) =>
      Math.abs(value - params.loopBars) < Math.abs(closest - params.loopBars) ? value : closest,
    16);

    return {
      ...params,
      bpm: clamp(Math.round(params.bpm), 64, 112),
      loopBars: nearestLoop,
      warmth: clamp01(params.warmth),
      swing: clamp01(params.swing),
      pocket: clamp01(params.pocket),
      chordRichness: clamp01(params.chordRichness),
      drumDensity: clamp01(params.drumDensity),
      bassActivity: clamp01(params.bassActivity),
      leadAmount: clamp01(params.leadAmount),
      ambience: clamp01(params.ambience),
      seed: Math.max(1, Math.floor(params.seed)),
    };
  }

  createTake(input: GenerationParameters): GeneratedTake {
    const params = this.normalizeParameters(input);
    const random = createSeededRandom(params.seed);
    const sceneProfile = getSceneProfile(params.scene);
    const mode: Mode = random() > sceneProfile.minorBias ? 'major' : 'minor';
    const sections = this.buildSections(params.loopBars, params.scene, params.arrangement);
    const progressionTemplate = choose(random, mode === 'major' ? MAJOR_PROGRESSIONS : MINOR_PROGRESSIONS);

    const chords: ChordEvent[] = [];
    const pad: ChordEvent[] = [];
    const comp: ChordEvent[] = [];
    const bass: NoteEvent[] = [];
    const lead: NoteEvent[] = [];
    const drums: DrumEvent[] = [];

    let previousVoicing: readonly number[] | null = null;
    for (let bar = 0; bar < params.loopBars; bar += 1) {
      const section = getSectionForBar(sections, bar);
      const progressionStep = progressionTemplate[bar % progressionTemplate.length];
      const rootMidi = getDegreeMidi(params.key, mode, progressionStep.degree, 3);
      const symbol = buildChordSymbol(rootMidi, progressionStep.quality);
      const voicing = voiceLead(
        buildVoicing(rootMidi, progressionStep.quality, params.chordRichness, params.warmth, random),
        previousVoicing,
      );
      previousVoicing = voicing;

      if (this.isPartEnabled(section.id, 'rhodes', params.arrangement)) {
        chords.push({
          beat: bar * 4,
          durationBeats: 4,
          midi: voicing,
          velocity: 0.32 + params.warmth * 0.22 + section.intensity * 0.12,
          pan: -0.25 + (bar % 4) * 0.12,
          symbol,
        });
      }

      const padSpacing = Math.max(1, sceneProfile.padSpacing - Number(params.ambience > 0.72));
      const shouldAddPad =
        this.isPartEnabled(section.id, 'pad', params.arrangement) &&
        (bar % padSpacing === 0 || section.id === 'outro' || (params.ambience > 0.82 && bar % 2 === 1));
      if (shouldAddPad) {
        pad.push({
          beat: bar * 4,
          durationBeats: Math.min(
            Math.round(4 * sceneProfile.padLengthMultiplier) * 2,
            (params.loopBars - bar) * 4,
          ),
          midi: voicing.map((note) => note + 12),
          velocity: 0.16 + params.ambience * 0.24 + section.intensity * 0.08,
          pan: 0.22 - (bar % 3) * 0.07,
          symbol,
        });
      }

      comp.push(...this.buildComp(bar, section, voicing, params, random));
      bass.push(...this.buildBass(bar, section, progressionStep.degree, mode, params, random));
      drums.push(...this.buildDrums(bar, section, params, random));
      lead.push(...this.buildLead(bar, section, progressionStep.degree, mode, params, random));
    }

    return {
      seed: params.seed,
      totalBars: params.loopBars,
      bpm: params.bpm,
      key: params.key,
      mode,
      sections,
      chords,
      pad,
      comp,
      bass,
      lead,
      drums,
    };
  }

  private buildSections(
    loopBars: number,
    scene: SceneIntensity,
    arrangement: ArrangementSelection,
  ): readonly ArrangementSection[] {
    const sectionIds =
      loopBars >= 16
        ? (['intro', 'groove', 'head', 'solo', 'outro'] as const)
        : (['intro', 'groove', 'head', 'outro'] as const);
    const sceneProfile = getSceneProfile(scene);
    const minimumBars = loopBars <= 8 ? 1 : 2;
    const barsBySection = distributeBars(
      loopBars,
      sectionIds,
      sectionIds.map((id) => sceneProfile.sectionWeights[id]),
      minimumBars,
    );

    let startBar = 0;
    return sectionIds.map((id) => {
      const section = {
        id,
        label: getSectionLabel(id, scene),
        startBar,
        bars: barsBySection[id],
        intensity: getSectionIntensity(id, sceneProfile.intensityOffset),
        activeParts: toActivePartLabels(arrangement[id]),
      };
      startBar += section.bars;
      return section;
    });
  }

  private buildComp(
    bar: number,
    section: ArrangementSection,
    voicing: readonly number[],
    params: GenerationParameters,
    random: () => number,
  ): readonly ChordEvent[] {
    if (!this.isPartEnabled(section.id, 'comp', params.arrangement)) {
      return [];
    }

    const sceneProfile = getSceneProfile(params.scene);
    const focusProfile = getFocusProfile(params.focus);
    const sectionModifier = section.id === 'intro' ? 0.35 : section.id === 'outro' ? 0.45 : section.id === 'solo' ? 0.78 : 1;
    const chance = Math.min(
      0.96,
      (0.26 + params.chordRichness * 0.38 + sceneProfile.compBias + focusProfile.compBias) * sectionModifier,
    );
    if (random() > chance) {
      return [];
    }

    const offsets =
      params.focus === 'guitar-led'
        ? [1, 2.5, 3.5]
        : params.chordRichness > 0.68 || params.scene === 'lounge'
          ? [1.25, 2.5, 3.25]
          : [1.5, 3.25];

    return offsets
      .filter((_, index) => index < 2 || random() < 0.35 + params.chordRichness * 0.5)
      .map((offset, index) => ({
        beat: bar * 4 + offset + humanize(random, params.pocket, 0.05),
        durationBeats:
          choose(random, focusProfile.durationOptions) *
          (index === 0 ? 0.8 : 0.6) *
          (params.focus === 'guitar-led' ? 0.9 : 0.72),
        midi: voicing
          .slice(1)
          .map((note) => note + 5 + (params.focus === 'guitar-led' ? getOctaveShift(params.octaveRange) * 4 : 0)),
        velocity: 0.16 + params.warmth * 0.18 + params.chordRichness * 0.08,
        pan: focusProfile.pan,
        symbol: 'comp',
      }));
  }

  private buildBass(
    bar: number,
    section: ArrangementSection,
    degree: number,
    mode: Mode,
    params: GenerationParameters,
    random: () => number,
  ): readonly NoteEvent[] {
    if (!this.isPartEnabled(section.id, 'bass', params.arrangement)) {
      return [];
    }

    const sceneProfile = getSceneProfile(params.scene);
    const root = getDegreeMidi(params.key, mode, degree, 2);
    const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
    const nextDegree = ((degree + 1) % 7) + 1;
    const leading = getDegreeMidi(params.key, mode, nextDegree, 2);
    const passing = root + choose(random, [2, 3, 5, 7].map((step) => scale[(step + degree) % 7] - scale[degree - 1] || 2));
    const anticipation = choose(random, [root + 5, root + 7, root + 10]);
    const trailing = params.bassActivity > 0.7 ? leading : root - 5;

    const pattern = [
      { beat: 0, note: root, duration: 1.5, threshold: 0 },
      { beat: 1.5 + humanize(random, params.pocket, 0.05), note: root + 7, duration: 0.5, threshold: 0.18 },
      { beat: 2.25 + humanize(random, params.pocket, 0.06), note: passing, duration: 0.4, threshold: 0.4 },
      { beat: 2.75 + humanize(random, params.pocket, 0.06), note: params.bassActivity > 0.55 ? anticipation : root, duration: 0.65, threshold: 0.54 },
      { beat: 3.35 + humanize(random, params.pocket + sceneProfile.pocketLag, 0.06), note: trailing, duration: 0.55, threshold: 0.68 },
    ];

    const activityModifier =
      (section.id === 'intro' ? 0.48 : section.id === 'outro' ? 0.7 : section.id === 'solo' ? 1.08 : 1) +
      sceneProfile.bassBias;

    return pattern
      .filter((step) => params.bassActivity * activityModifier >= step.threshold || random() < params.bassActivity * 0.55)
      .map((step) => ({
        beat: bar * 4 + step.beat,
        durationBeats: step.duration + params.warmth * 0.12,
        midi: step.note,
        velocity: 0.24 + params.bassActivity * 0.28 + params.warmth * 0.08,
        slide: params.bassActivity * 0.12 + (params.scene === 'after-hours' ? 0.04 : 0),
        pan: -0.05,
      }));
  }

  private buildLead(
    bar: number,
    section: ArrangementSection,
    degree: number,
    mode: Mode,
    params: GenerationParameters,
    random: () => number,
  ): readonly NoteEvent[] {
    if (!this.isPartEnabled(section.id, 'lead', params.arrangement)) {
      return [];
    }

    const sceneProfile = getSceneProfile(params.scene);
    const focusProfile = getFocusProfile(params.focus);
    const phraseChance =
      (section.id === 'solo'
        ? 0.62
        : section.id === 'intro'
          ? 0.14
          : section.id === 'groove'
            ? 0.26
            : section.id === 'outro'
              ? 0.22
              : 0.42) +
      params.leadAmount * 0.42 +
      sceneProfile.leadBias +
      focusProfile.phraseBias;
    if (random() > phraseChance) {
      return [];
    }

    const register = this.getLeadRegister(params);
    const root = getDegreeMidi(params.key, mode, degree, register);
    const palette = focusProfile.paletteOffsets.map((offset) => root + offset);
    const phraseStarts =
      section.id === 'solo'
        ? focusProfile.phraseStarts
        : focusProfile.phraseStarts.filter((_, index) => index < 2 + Number(params.leadAmount > 0.72));

    return phraseStarts
      .filter((_, index) => {
        const threshold = 0.45 + params.leadAmount * 0.42 - index * 0.08 + sceneProfile.leadBias;
        return random() < threshold;
      })
      .map((start, index) => ({
        beat: bar * 4 + start + humanize(random, params.pocket, 0.08),
        durationBeats:
          choose(random, focusProfile.durationOptions) *
          (section.id === 'intro' || params.scene === 'nightfall' ? 1.1 : 1),
        midi: choose(random, palette),
        velocity: 0.2 + params.leadAmount * 0.34 + (section.id === 'solo' ? 0.08 : 0),
        slide: params.leadAmount * 0.12 + focusProfile.slideBias,
        pan: focusProfile.pan + (index % 2 === 0 ? -0.03 : 0.03),
      }));
  }

  private getLeadRegister(params: GenerationParameters): number {
    return getFocusProfile(params.focus).baseRegister + getOctaveShift(params.octaveRange);
  }

  private buildDrums(
    bar: number,
    section: ArrangementSection,
    params: GenerationParameters,
    random: () => number,
  ): readonly DrumEvent[] {
    if (!this.isPartEnabled(section.id, 'drums', params.arrangement)) {
      return [];
    }

    const sceneProfile = getSceneProfile(params.scene);
    const swingOffset = params.swing * (0.16 + sceneProfile.drumBias * 0.03);
    const pocketLag = params.pocket * 0.08 + sceneProfile.pocketLag;
    const densityModifier = (section.id === 'intro' ? 0.36 : section.id === 'outro' ? 0.52 : section.id === 'solo' ? 1.08 : 1) + sceneProfile.drumBias;
    const beatBase = bar * 4;
    const events: DrumEvent[] = [
      { beat: beatBase, durationBeats: 0.5, velocity: 0.82 * densityModifier, instrument: 'kick', pan: 0 },
      {
        beat: beatBase + 2 + pocketLag + humanize(random, params.pocket, 0.03),
        durationBeats: 0.45,
        velocity: 0.56 * densityModifier,
        instrument: 'snare',
        pan: 0.03,
      },
    ];

    if (random() < (0.42 + params.drumDensity * 0.52) * densityModifier) {
      events.push({
        beat: beatBase + 2.75 + pocketLag * 0.4 + humanize(random, params.pocket, 0.05),
        durationBeats: 0.3,
        velocity: 0.58 * densityModifier,
        instrument: 'kick',
        pan: 0,
      });
    }

    for (let step = 0; step < 8; step += 1) {
      if (step % 2 === 1 && random() > (0.4 + params.drumDensity * 0.5) * densityModifier) {
        continue;
      }

      const beat = beatBase + step * 0.5 + (step % 2 === 1 ? swingOffset : 0);
      events.push({
        beat,
        durationBeats: step % 2 === 0 ? 0.18 : 0.24,
        velocity: (step % 2 === 0 ? 0.18 : 0.26 + params.drumDensity * 0.12) * densityModifier,
        instrument: 'hat',
        pan: step % 2 === 0 ? -0.08 : 0.12,
      });

      if (params.drumDensity > 0.66 && step % 2 === 0 && random() < 0.72 * densityModifier) {
        events.push({
          beat: beat + 0.25 + swingOffset * 0.3,
          durationBeats: 0.14,
          velocity: (0.12 + params.drumDensity * 0.08) * densityModifier,
          instrument: 'hat',
          pan: 0.1,
        });
      }
    }

    if (random() < params.drumDensity * 0.55 * densityModifier) {
      events.push({
        beat: beatBase + 3.5 + swingOffset,
        durationBeats: 0.42,
        velocity: (0.2 + params.drumDensity * 0.18) * densityModifier,
        instrument: 'open-hat',
        pan: 0.16,
      });
    }

    if (params.drumDensity > 0.48 && random() < 0.6 * densityModifier) {
      events.push({
        beat: beatBase + 1.75 + pocketLag * 0.5,
        durationBeats: 0.16,
        velocity: (0.18 + params.drumDensity * 0.1) * densityModifier,
        instrument: 'snare',
        pan: -0.04,
      });
    }

    return events;
  }

  private isPartEnabled(sectionId: SectionId, partId: PartId, arrangement: ArrangementSelection): boolean {
    return arrangement[sectionId][partId];
  }
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function choose<T>(random: () => number, values: readonly T[]): T {
  return values[Math.floor(random() * values.length)];
}

function getSectionForBar(sections: readonly ArrangementSection[], bar: number): ArrangementSection {
  return sections.find((section) => bar >= section.startBar && bar < section.startBar + section.bars) ?? sections[sections.length - 1];
}

function toActivePartLabels(selection: ArrangementSelection[SectionId]): readonly string[] {
  return (Object.entries(selection) as Array<[PartId, boolean]>)
    .filter(([, enabled]) => enabled)
    .map(([partId]) => PART_LABELS[partId]);
}

const PART_LABELS: Record<PartId, string> = {
  rhodes: 'Rhodes',
  pad: 'Pad',
  comp: 'Comp',
  bass: 'Bass',
  lead: 'Lead',
  drums: 'Drums',
};

function getDegreeMidi(key: MusicalKey, mode: Mode, degree: number, octave: number): number {
  const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
  const interval = scale[(degree - 1 + 7) % 7];
  return 12 * (octave + 1) + KEY_TO_SEMITONE[key] + interval;
}

function buildChordSymbol(rootMidi: number, quality: ChordQuality): string {
  const root = SEMITONE_TO_NOTE[rootMidi % 12];
  return `${root}${quality}`;
}

function buildVoicing(
  rootMidi: number,
  quality: ChordQuality,
  richness: number,
  warmth: number,
  random: () => number,
): readonly number[] {
  const intervals = getChordIntervals(quality, richness);
  const notes = intervals.map((interval, index) => rootMidi + interval + (index > 1 && random() > 0.62 ? 12 : 0));

  if (warmth > 0.7 && notes.length > 3) {
    notes[1] -= 12;
  }

  if (warmth < 0.32 && notes.length > 3) {
    notes[1] += 12;
  }

  return notes.sort((left, right) => left - right);
}

function voiceLead(current: readonly number[], previous: readonly number[] | null): readonly number[] {
  if (!previous) {
    return current;
  }

  const averagePrevious = average(previous);
  let candidate = [...current];
  let averageCurrent = average(candidate);

  while (averageCurrent - averagePrevious > 6) {
    candidate = candidate.map((note) => note - 12);
    averageCurrent = average(candidate);
  }

  while (averagePrevious - averageCurrent > 6) {
    candidate = candidate.map((note) => note + 12);
    averageCurrent = average(candidate);
  }

  return candidate;
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function humanize(random: () => number, amount: number, scale: number): number {
  return (random() - 0.5) * scale * (0.2 + amount);
}

function getSceneProfile(scene: SceneIntensity): SceneProfile {
  switch (scene) {
    case 'nightfall':
      return {
        minorBias: 0.72,
        sectionWeights: { intro: 1.35, groove: 1.05, head: 1.2, solo: 0.8, outro: 1.2 },
        intensityOffset: -0.04,
        padSpacing: 1,
        padLengthMultiplier: 2,
        compBias: -0.06,
        bassBias: -0.04,
        leadBias: -0.08,
        drumBias: -0.06,
        pocketLag: 0.03,
      };
    case 'lounge':
      return {
        minorBias: 0.38,
        sectionWeights: { intro: 0.8, groove: 1.15, head: 1.45, solo: 0.9, outro: 0.9 },
        intensityOffset: 0,
        padSpacing: 2,
        padLengthMultiplier: 1.5,
        compBias: 0.08,
        bassBias: 0.04,
        leadBias: 0,
        drumBias: 0.02,
        pocketLag: 0.02,
      };
    default:
      return {
        minorBias: 0.58,
        sectionWeights: { intro: 0.95, groove: 1.05, head: 1.1, solo: 1.3, outro: 0.9 },
        intensityOffset: 0.05,
        padSpacing: 2,
        padLengthMultiplier: 1.75,
        compBias: 0,
        bassBias: 0.08,
        leadBias: 0.08,
        drumBias: 0.06,
        pocketLag: 0.025,
      };
  }
}

function getFocusProfile(focus: GenerationParameters['focus']): FocusProfile {
  switch (focus) {
    case 'muted-trumpet':
      return {
        baseRegister: 5,
        compBias: -0.02,
        phraseBias: 0.05,
        pan: 0.05,
        slideBias: 0.02,
        paletteOffsets: [2, 5, 9, 10, 14, 17],
        phraseStarts: [0.5, 1.5, 2.75, 3.5],
        durationOptions: [0.45, 0.6, 0.8, 1.1],
      };
    case 'guitar-led':
      return {
        baseRegister: 4,
        compBias: 0.18,
        phraseBias: -0.04,
        pan: 0.26,
        slideBias: 0,
        paletteOffsets: [0, 4, 7, 12, 16],
        phraseStarts: [0.75, 2, 3.25],
        durationOptions: [0.35, 0.55, 0.75],
      };
    default:
      return {
        baseRegister: 5,
        compBias: 0.02,
        phraseBias: 0.02,
        pan: 0.12,
        slideBias: 0.05,
        paletteOffsets: [0, 2, 5, 7, 10, 14],
        phraseStarts: [0.75, 2, 3, 3.75],
        durationOptions: [0.7, 1, 1.35, 1.7],
      };
  }
}

function getOctaveShift(range: GenerationParameters['octaveRange']): number {
  switch (range) {
    case 'low':
      return -1;
    case 'high':
      return 1;
    default:
      return 0;
  }
}

function getSectionLabel(sectionId: SectionId, scene: SceneIntensity): string {
  if (sectionId === 'groove') {
    return scene === 'nightfall' ? 'Settle' : 'Groove in';
  }

  if (sectionId === 'outro') {
    return scene === 'nightfall' ? 'Fade' : 'Outro';
  }

  if (sectionId === 'head' && scene === 'lounge') {
    return 'Headroom';
  }

  return sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

function getSectionIntensity(sectionId: SectionId, offset: number): number {
  const baseIntensity: Record<SectionId, number> = {
    intro: 0.2,
    groove: 0.46,
    head: 0.72,
    solo: 0.8,
    outro: 0.32,
  };
  return clamp01(baseIntensity[sectionId] + offset);
}

function distributeBars<T extends string>(
  totalBars: number,
  sectionIds: readonly T[],
  weights: readonly number[],
  minimumPerSection: number,
): Record<T, number> {
  const sumWeights = weights.reduce((sum, value) => sum + value, 0);
  const desired = sectionIds.map((sectionId, index) => ({
    sectionId,
    target: Math.max(minimumPerSection, (weights[index] / sumWeights) * totalBars),
  }));
  const bars = Object.fromEntries(
    desired.map(({ sectionId, target }) => [sectionId, Math.max(minimumPerSection, Math.floor(target))]),
  ) as Record<T, number>;

  let allocated = (Object.values(bars) as number[]).reduce((sum, value) => sum + value, 0);
  if (allocated > totalBars) {
    const descending = [...desired].sort((left, right) => bars[right.sectionId] - bars[left.sectionId]);
    for (const item of descending) {
      while (allocated > totalBars && bars[item.sectionId] > minimumPerSection) {
        bars[item.sectionId] -= 1;
        allocated -= 1;
      }
    }
  }

  if (allocated < totalBars) {
    const byRemainder = [...desired].sort(
      (left, right) => right.target - bars[right.sectionId] - (left.target - bars[left.sectionId]),
    );
    let index = 0;
    while (allocated < totalBars) {
      const item = byRemainder[index % byRemainder.length];
      bars[item.sectionId] += 1;
      allocated += 1;
      index += 1;
    }
  }

  return bars;
}

function getChordIntervals(quality: ChordQuality, richness: number): readonly number[] {
  const extended = richness > 0.58;
  const spacious = richness > 0.8;

  switch (quality) {
    case 'maj9':
      return extended ? [0, 4, 7, 11, 14] : [0, 7, 11, 14];
    case 'maj13':
      return spacious ? [0, 4, 11, 14, 21] : [0, 7, 11, 14, 17];
    case 'm9':
      return extended ? [0, 3, 7, 10, 14] : [0, 7, 10, 14];
    case 'm11':
      return spacious ? [0, 3, 10, 14, 17] : [0, 7, 10, 14, 17];
    case '13':
      return spacious ? [0, 4, 10, 14, 21] : [0, 7, 10, 14, 17];
    case 'sus13':
      return spacious ? [0, 5, 10, 14, 21] : [0, 7, 10, 14, 17];
    default:
      return [0, 7, 10, 14];
  }
}
