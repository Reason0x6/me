import { buildPianoChordSequence, createSamplerUrls, drumInstrumentToPianoMidi } from './jazz-audio-engine.service';

describe('createSamplerUrls', () => {
  it('should convert manifest entries into local data urls', () => {
    const urls = createSamplerUrls({
      C4: 'UklGRg==',
      G4: 'UklGRw==',
    });

    expect(urls['C4']).toBe('data:audio/wav;base64,UklGRg==');
    expect(urls['G4']).toBe('data:audio/wav;base64,UklGRw==');
  });
});

describe('buildPianoChordSequence', () => {
  it('should create a rolled piano pattern that starts with the full chord ascent', () => {
    const steps = buildPianoChordSequence(['C4', 'E4', 'G4', 'B4'], 2.4);

    expect(steps.map((step) => step.note)).toEqual(['C4', 'E4', 'G4', 'B4', 'G4', 'E4']);
    expect(steps[0].offsetSeconds).toBe(0);
    expect(steps[1].offsetSeconds).toBeGreaterThan(steps[0].offsetSeconds);
  });
});

describe('drumInstrumentToPianoMidi', () => {
  it('should map each drum voice into a fixed piano register', () => {
    expect(drumInstrumentToPianoMidi('kick')).toBe(36);
    expect(drumInstrumentToPianoMidi('snare')).toBe(50);
    expect(drumInstrumentToPianoMidi('hat')).toBe(54);
    expect(drumInstrumentToPianoMidi('open-hat')).toBe(57);
  });
});
