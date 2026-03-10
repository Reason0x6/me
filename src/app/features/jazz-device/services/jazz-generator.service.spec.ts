import { JazzGeneratorService } from './jazz-generator.service';
import { JazzPresetsService } from './jazz-presets.service';

describe('JazzGeneratorService', () => {
  const presets = new JazzPresetsService();
  let service: JazzGeneratorService;

  beforeEach(() => {
    service = new JazzGeneratorService();
  });

  it('should reproduce the same arrangement for the same seed', () => {
    const params = presets.createDefaultParameters();
    const first = service.createTake(params);
    const second = service.createTake(params);

    expect(first.sections).toEqual(second.sections);
    expect(first.chords.slice(0, 6)).toEqual(second.chords.slice(0, 6));
    expect(first.lead.slice(0, 8)).toEqual(second.lead.slice(0, 8));
    expect(first.drums.slice(0, 12)).toEqual(second.drums.slice(0, 12));
  });

  it('should change the take when the seed changes', () => {
    const base = presets.createDefaultParameters();
    const changed = { ...base, seed: base.seed + 11 };
    const first = service.createTake(base);
    const second = service.createTake(changed);

    expect(first.chords.slice(0, 4)).not.toEqual(second.chords.slice(0, 4));
    expect(first.lead.slice(0, 6)).not.toEqual(second.lead.slice(0, 6));
  });

  it('should clamp and normalize incoming parameters', () => {
    const normalized = service.normalizeParameters({
      ...presets.createDefaultParameters(),
      bpm: 200,
      loopBars: 14,
      warmth: 4,
      drumDensity: -2,
    });

    expect(normalized.bpm).toBe(112);
    expect(normalized.loopBars).toBe(16);
    expect(normalized.warmth).toBe(1);
    expect(normalized.drumDensity).toBe(0);
  });

  it('should omit parts that are disabled in the arrangement map', () => {
    const params = presets.createDefaultParameters();
    const take = service.createTake({
      ...params,
      arrangement: {
        ...params.arrangement,
        intro: { ...params.arrangement.intro, rhodes: false, pad: false },
        groove: { ...params.arrangement.groove, drums: false, bass: false },
        head: { ...params.arrangement.head, lead: false },
        solo: { ...params.arrangement.solo, comp: false, lead: false },
        outro: { ...params.arrangement.outro, bass: false },
      },
    });

    expect(take.sections.find((section) => section.id === 'intro')?.activeParts).not.toContain('Rhodes');
    expect(take.sections.find((section) => section.id === 'groove')?.activeParts).not.toContain('Drums');
    expect(take.sections.find((section) => section.id === 'head')?.activeParts).not.toContain('Lead');

    const grooveStart = take.sections.find((section) => section.id === 'groove')?.startBar ?? 0;
    const grooveEnd = grooveStart + (take.sections.find((section) => section.id === 'groove')?.bars ?? 0);
    const grooveDrums = take.drums.filter((event) => {
      const bar = Math.floor(event.beat / 4);
      return bar >= grooveStart && bar < grooveEnd;
    });
    expect(grooveDrums.length).toBe(0);
  });

  it('should allow enabled parts to generate inside sections that were previously hard-blocked', () => {
    const params = presets.createDefaultParameters();
    const take = service.createTake({
      ...params,
      drumDensity: 1,
      arrangement: {
        ...params.arrangement,
        intro: {
          rhodes: false,
          pad: false,
          comp: false,
          bass: false,
          lead: false,
          drums: true,
        },
      },
    });

    const intro = take.sections.find((section) => section.id === 'intro');
    const introDrums = take.drums.filter((event) => {
      const bar = Math.floor(event.beat / 4);
      return bar >= (intro?.startBar ?? 0) && bar < (intro?.startBar ?? 0) + (intro?.bars ?? 0);
    });

    expect(intro?.activeParts).toContain('Drums');
    expect(introDrums.length).toBeGreaterThan(0);
  });

  it('should change structure and event density when the scene changes', () => {
    const params = {
      ...presets.createDefaultParameters(),
      seed: 90210,
      loopBars: 16,
      drumDensity: 0.8,
      bassActivity: 0.72,
      leadAmount: 0.82,
    };

    const nightfall = service.createTake({ ...params, scene: 'nightfall' });
    const lounge = service.createTake({ ...params, scene: 'lounge' });

    expect(nightfall.sections.map((section) => `${section.id}:${section.bars}`)).not.toEqual(
      lounge.sections.map((section) => `${section.id}:${section.bars}`),
    );
    expect(nightfall.drums.length).not.toBe(lounge.drums.length);
    expect(nightfall.pad.length).not.toBe(lounge.pad.length);
  });

  it('should change lead phrasing and comp behavior when focus changes', () => {
    const params = {
      ...presets.createDefaultParameters(),
      seed: 48151,
      leadAmount: 0.94,
      chordRichness: 0.84,
    };

    const woodwind = service.createTake({ ...params, focus: 'woodwind' });
    const guitarLed = service.createTake({ ...params, focus: 'guitar-led' });

    expect(guitarLed.lead.slice(0, 6)).not.toEqual(woodwind.lead.slice(0, 6));
    expect(averageDuration(guitarLed.comp)).not.toBeCloseTo(averageDuration(woodwind.comp), 2);
  });

  it('should move the lead register when the octave range changes', () => {
    const params = {
      ...presets.createDefaultParameters(),
      seed: 73124,
      leadAmount: 1,
    };

    const lowTake = service.createTake({ ...params, octaveRange: 'low' });
    const highTake = service.createTake({ ...params, octaveRange: 'high' });

    expect(averageMidi(highTake.lead)).toBeGreaterThan(averageMidi(lowTake.lead) + 8);
  });

  it('should make density and richness controls materially change generated content', () => {
    const params = {
      ...presets.createDefaultParameters(),
      seed: 18841,
      leadAmount: 0.84,
    };

    const sparse = service.createTake({
      ...params,
      drumDensity: 0.12,
      bassActivity: 0.18,
      chordRichness: 0.2,
    });
    const dense = service.createTake({
      ...params,
      drumDensity: 0.94,
      bassActivity: 0.92,
      chordRichness: 0.92,
    });

    expect(dense.drums.length).toBeGreaterThan(sparse.drums.length);
    expect(dense.bass.length).toBeGreaterThan(sparse.bass.length);
    expect(averageChordSize(dense.chords)).toBeGreaterThan(averageChordSize(sparse.chords));
  });
});

function averageMidi(events: readonly { midi: number }[]): number {
  const values = events.map((event) => event.midi);
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageChordSize(events: readonly { midi: readonly number[] }[]): number {
  const sizes = events.map((event) => event.midi.length);
  if (sizes.length === 0) {
    return 0;
  }
  return sizes.reduce((sum, value) => sum + value, 0) / sizes.length;
}

function averageDuration(events: readonly { durationBeats: number }[]): number {
  const durations = events.map((event) => event.durationBeats);
  if (durations.length === 0) {
    return 0;
  }
  return durations.reduce((sum, value) => sum + value, 0) / durations.length;
}
