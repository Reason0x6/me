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
});
