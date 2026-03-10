import { createSamplerUrls } from './jazz-audio-engine.service';

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
