import { THOUGHTS } from './thoughts.data';

describe('THOUGHTS', () => {
  it('uses unique numbers and slugs', () => {
    expect(new Set(THOUGHTS.map((thought) => thought.number)).size).toBe(THOUGHTS.length);
    expect(new Set(THOUGHTS.map((thought) => thought.slug)).size).toBe(THOUGHTS.length);
  });

  it('only links to thoughts that exist', () => {
    const slugs = new Set(THOUGHTS.map((thought) => thought.slug));
    const missing = THOUGHTS.flatMap((thought) => thought.related.filter((slug) => !slugs.has(slug)));

    expect(missing).toEqual([]);
  });

  it('publishes the Internet geometry paper at its dedicated route', () => {
    const paper = THOUGHTS.find((thought) => thought.slug === 'what-shape-is-the-internet');

    expect(paper?.kind).toBe('White paper');
    expect(paper?.path).toBe('/papers/what-shape-is-the-internet');
  });

  it('publishes the World Rank paper at its dedicated route', () => {
    const paper = THOUGHTS.find((thought) => thought.slug === 'how-many-facts-does-reality-contain');

    expect(paper?.kind).toBe('White paper');
    expect(paper?.path).toBe('/papers/how-many-facts-does-reality-contain');
  });

  it('publishes the voice verification paper at its dedicated route', () => {
    const paper = THOUGHTS.find((thought) => thought.slug === 'zero-trust-voice-verification');

    expect(paper?.kind).toBe('White paper');
    expect(paper?.path).toBe('/papers/zero-trust-voice-verification');
  });
});
