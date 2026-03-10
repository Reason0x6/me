import { Injectable } from '@angular/core';

import {
  ArrangementSelection,
  DialOption,
  GenerationParameters,
  LeadFocus,
  MusicalKey,
  OctaveRange,
  PartLevels,
  SceneIntensity,
} from '../models/jazz-device.types';

@Injectable({ providedIn: 'root' })
export class JazzPresetsService {
  private readonly musicalKeys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

  readonly keys: readonly DialOption<MusicalKey>[] = [
    ...this.musicalKeys.map((value) => ({ label: value, value })),
  ];

  readonly loopLengths: readonly DialOption<number>[] = [
    { label: '8 bars', value: 8 },
    { label: '12 bars', value: 12 },
    { label: '16 bars', value: 16 },
    { label: '24 bars', value: 24 },
  ];

  readonly focusOptions: readonly DialOption<LeadFocus>[] = [
    { label: 'Woodwind', value: 'woodwind' },
    { label: 'Muted trumpet', value: 'muted-trumpet' },
    { label: 'Guitar-led', value: 'guitar-led' },
  ];

  readonly octaveOptions: readonly DialOption<OctaveRange>[] = [
    { label: 'Low', value: 'low' },
    { label: 'Mid', value: 'mid' },
    { label: 'High', value: 'high' },
  ];

  readonly sceneOptions: readonly DialOption<SceneIntensity>[] = [
    { label: 'Nightfall', value: 'nightfall' },
    { label: 'Lounge', value: 'lounge' },
    { label: 'After hours', value: 'after-hours' },
  ];

  createDefaultParameters(): GenerationParameters {
    return {
      seed: 41827,
      freezeSeed: false,
      bpm: 86,
      key: 'Eb',
      loopBars: 16,
      warmth: 0.72,
      swing: 0.28,
      pocket: 0.4,
      chordRichness: 0.72,
      drumDensity: 0.48,
      bassActivity: 0.46,
      leadAmount: 0.52,
      ambience: 0.64,
      focus: 'woodwind',
      octaveRange: 'mid',
      scene: 'after-hours',
      arrangement: this.createDefaultArrangement(),
    };
  }

  createDefaultPartLevels(): PartLevels {
    return {
      rhodes: 0.2,
      pad: 0.2,
      comp: 0.4,
      bass: 0.56,
      lead: 0.3,
      drums: 0.7,
    };
  }

  createDefaultArrangement(): ArrangementSelection {
    return {
      intro: {
        rhodes: true,
        pad: true,
        comp: false,
        bass: false,
        lead: false,
        drums: false,
      },
      groove: {
        rhodes: true,
        pad: true,
        comp: false,
        bass: true,
        lead: false,
        drums: true,
      },
      head: {
        rhodes: true,
        pad: true,
        comp: false,
        bass: true,
        lead: true,
        drums: true,
      },
      solo: {
        rhodes: true,
        pad: true,
        comp: true,
        bass: true,
        lead: true,
        drums: true,
      },
      outro: {
        rhodes: true,
        pad: true,
        comp: false,
        bass: true,
        lead: false,
        drums: false,
      },
    };
  }
}
