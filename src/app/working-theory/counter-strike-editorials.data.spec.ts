import { COUNTER_STRIKE_EDITORIALS, findCounterStrikeEditorial } from './counter-strike-editorials.data';

describe('COUNTER_STRIKE_EDITORIALS', () => {
  it('publishes nine distinct, fully sourced editorials', () => {
    expect(COUNTER_STRIKE_EDITORIALS.length).toBe(9);
    expect(new Set(COUNTER_STRIKE_EDITORIALS.map((item) => item.slug)).size).toBe(9);

    for (const editorial of COUNTER_STRIKE_EDITORIALS) {
      expect(editorial.sections.length).toBeGreaterThanOrEqual(5);
      expect(editorial.sources.length).toBeGreaterThanOrEqual(3);
      expect(editorial.heroStats.length).toBe(4);
    }
  });

  it('publishes a probabilistic forecast for every remaining 2026 S-tier event', () => {
    const forecast = findCounterStrikeEditorial('predicting-every-remaining-s-tier-counter-strike-event-2026');

    expect(forecast?.heroStats.some((stat) => stat.value === '9')).toBeTrue();
    expect(forecast?.heroStats.some((stat) => stat.value === '2.56')).toBeTrue();
    expect(forecast?.sections.length).toBe(11);
    expect(forecast?.sources.length).toBeGreaterThanOrEqual(20);
    expect(forecast?.sections.some((section) => section.title.includes('Nine picks'))).toBeTrue();
  });

  it('publishes the jL stress test and the technical VRS explainer', () => {
    const jl = findCounterStrikeEditorial('how-replaceable-is-a-counter-strike-system-vitality-jl-experiment');
    const vrs = findCounterStrikeEditorial('valve-regional-standings-vrs-technical-explainer');

    expect(jl?.heroStats.some((stat) => stat.value === '+24')).toBeTrue();
    expect(jl?.sections.length).toBe(7);
    expect(vrs?.sections.length).toBe(10);
    expect(vrs?.sources.length).toBeGreaterThanOrEqual(10);
    expect(vrs?.sections.some((section) => section.title.includes('fixed-RD Glicko'))).toBeTrue();
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

  it('publishes separate, evidence-led tactical legacies for Astralis and Vitality', () => {
    const astralis = findCounterStrikeEditorial('how-astralis-wrote-the-grammar-of-modern-counter-strike');
    const vitality = findCounterStrikeEditorial('how-ropz-era-vitality-rebuilt-the-superteam');

    expect(astralis?.sections.length).toBe(7);
    expect(astralis?.heroStats.some((stat) => stat.value === '29.0')).toBeTrue();
    expect(astralis?.sources.length).toBeGreaterThanOrEqual(8);
    expect(vitality?.sections.length).toBe(8);
    expect(vitality?.heroStats.some((stat) => stat.value === '37')).toBeTrue();
    expect(vitality?.sources.length).toBeGreaterThanOrEqual(10);
  });
});
