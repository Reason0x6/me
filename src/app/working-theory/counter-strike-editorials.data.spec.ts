import { COUNTER_STRIKE_EDITORIALS, findCounterStrikeEditorial } from './counter-strike-editorials.data';

describe('COUNTER_STRIKE_EDITORIALS', () => {
  it('publishes four distinct, fully sourced editorials', () => {
    expect(COUNTER_STRIKE_EDITORIALS.length).toBe(4);
    expect(new Set(COUNTER_STRIKE_EDITORIALS.map((item) => item.slug)).size).toBe(4);

    for (const editorial of COUNTER_STRIKE_EDITORIALS) {
      expect(editorial.sections.length).toBeGreaterThanOrEqual(5);
      expect(editorial.sources.length).toBeGreaterThanOrEqual(3);
      expect(editorial.heroStats.length).toBe(4);
    }
  });

  it('keeps the published aggregate calculations explicit', () => {
    const spirit = findCounterStrikeEditorial('is-team-spirit-the-best-team-in-the-world');
    const vitality = findCounterStrikeEditorial('how-spirit-finally-solved-vitality');
    const fut = findCounterStrikeEditorial('fut-esports-cinderella-run-or-tier-one-arrival');

    expect(spirit?.heroStats.some((stat) => stat.value === '13–4')).toBeTrue();
    expect(vitality?.heroStats.some((stat) => stat.value === '40–30')).toBeTrue();
    expect(fut?.heroStats.some((stat) => stat.value === '10–6')).toBeTrue();
  });

  it('makes the GOAT comparison rules and statistical uncertainty explicit', () => {
    const goat = findCounterStrikeEditorial('vitality-astralis-greatest-team-of-all-time');

    expect(goat?.verdict).toContain('Astralis');
    expect(goat?.sections.some((section) => section.eyebrow === 'Statistical restraint')).toBeTrue();
    expect(goat?.sources.length).toBeGreaterThanOrEqual(10);
  });
});
