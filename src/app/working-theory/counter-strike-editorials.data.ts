import { COUNTER_STRIKE_META_EDITORIALS } from './counter-strike-meta-editorials.data';

export interface EditorialStat {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
}

export interface EditorialTable {
  readonly caption: string;
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly note?: string;
}

export interface EditorialBar {
  readonly label: string;
  readonly value: number;
  readonly display: string;
  readonly detail?: string;
}

export interface EditorialSection {
  readonly number: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly stats?: readonly EditorialStat[];
  readonly table?: EditorialTable;
  readonly bars?: readonly EditorialBar[];
  readonly callout?: string;
}

export interface EditorialSource {
  readonly label: string;
  readonly url: string;
  readonly use: string;
}

export interface CounterStrikeEditorial {
  readonly slug: string;
  readonly number: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly dek: string;
  readonly verdict: string;
  readonly verdictDetail: string;
  readonly readingMinutes: number;
  readonly publishedAt: string;
  readonly dataCutoff: string;
  readonly sample: string;
  readonly heroStats: readonly EditorialStat[];
  readonly sections: readonly EditorialSection[];
  readonly sources: readonly EditorialSource[];
}

export const COUNTER_STRIKE_EDITORIALS: readonly CounterStrikeEditorial[] = [
  {
    slug: 'is-team-spirit-the-best-team-in-the-world',
    number: '026',
    title: 'Is Team Spirit Actually the Best Team in the World?',
    shortTitle: 'The case for Spirit',
    dek: 'The rankings say yes. The recent form says yes. The trophy cabinet says “not quite an era.” A measured verdict on what best should mean in an unstable field.',
    verdict: 'Yes—for now.',
    verdictDetail: 'Spirit have the strongest current claim, but “best today” is not the same proposition as “dominant across the season.” The former is supported; the latter still needs another elite title or a Major.',
    readingMinutes: 13,
    publishedAt: '2026-08-28',
    dataCutoff: '28 August 2026',
    sample: 'HLTV team form over the preceding three months; the complete EWC 2026 run; 2026 Big Event placements available at publication.',
    heroStats: [
      { value: '#1', label: 'Current position', detail: 'HLTV and Valve ranking at the data cut-off' },
      { value: '85.7%', label: 'Recent series win rate', detail: 'HLTV three-month team window' },
      { value: '13–4', label: 'EWC map record', detail: '76.5% across 17 maps, including the opening BO1' },
      { value: '2', label: '2026 titles', detail: 'PGL Astana and Esports World Cup' },
    ],
    sections: [
      {
        number: '01',
        eyebrow: 'Define the claim',
        title: '“Best” is a current estimate, not a lifetime achievement award.',
        paragraphs: [
          'A world ranking, a trophy count and a head-to-head result answer different questions. Rankings estimate strength over a weighted history. Trophies measure conversion at specific events. Head-to-heads expose stylistic matchups. Treating any one of them as the definition of “best” guarantees a confident answer built on a partial sample.',
          'The cleanest operational definition is this: if the elite field played a serious event tomorrow, which team would deserve the shortest pre-tournament price before the bracket was known? On 28 August, Spirit are the answer. They are ranked first, have won 85.7% of their series over the previous three months, and have just completed the hardest available act of validation: winning a 32-team event while eliminating Vitality and then surviving a best-of-five final.',
          'That conclusion is deliberately temporary. Counter-Strike lineups, map pools and tournament formats move too quickly for “best” to behave like a permanent title. A useful verdict should be capable of changing after Porto rather than pretending EWC ended the argument forever.',
        ],
        stats: [
          { value: '6–0', label: 'Series after the opening upset', detail: 'Spirit did not lose another series in Paris' },
          { value: '13–3', label: 'Maps in those six series', detail: '81.3% after the 10–13 BO1 loss to JiJieHao' },
          { value: '4 / 5', label: 'Recent finals reached', detail: 'Reported before the EWC final; conversion remains the question' },
        ],
        callout: 'The strongest claim is not “Spirit cannot lose.” It is “no rival currently combines ranking, recent win rate, bracket quality and map breadth as well.”',
      },
      {
        number: '02',
        eyebrow: 'The Paris sample',
        title: 'The EWC run was resilient before it was dominant.',
        paragraphs: [
          'Spirit began with a 10–13 best-of-one loss to JiJieHao. That result matters because it prevents the lazy version of the story: this was not an untouched march through an easy bracket. From the lower-pressure edge of elimination, Spirit won six consecutive series and 13 of the next 16 maps.',
          'The opponents also became progressively stronger. Luminosity and BIG restored the run; B8 was dispatched 2–0; Vitality, the matchup Spirit had lost six consecutive times, fell 2–1; Legacy fell 2–0; and FUT took only the opening map of the final. The tournament record was 13–4 on maps, or 76.5%. Excluding the volatile opening BO1, it was 81.3%. The four-and-a-half-point difference is a reminder that format is part of performance measurement.',
          'The final was not a flat stomp. Spirit lost Cache 10–13, required overtime on Anubis and Ancient, then won Nuke 13–5. Across the four maps they won 55 rounds to 45, a ten-round margin generated almost entirely after the series had reached its highest-pressure state. That ability to absorb close maps and still produce the clean final map is stronger evidence than the 3–1 headline alone.',
        ],
        table: {
          caption: 'Spirit at Esports World Cup 2026',
          headers: ['Stage', 'Opponent', 'Series', 'Maps won–lost'],
          rows: [
            ['Opening BO1', 'JiJieHao', '10–13 loss', '0–1'],
            ['Group', 'Luminosity', '2–0 win', '2–0'],
            ['Group', 'BIG', '2–1 win', '2–1'],
            ['Round of 16', 'B8', '2–0 win', '2–0'],
            ['Quarter-final', 'Vitality', '2–1 win', '2–1'],
            ['Semi-final', 'Legacy', '2–0 win', '2–0'],
            ['Final', 'FUT', '3–1 win', '3–1'],
            ['Total', 'Seven opponents', '6–1', '13–4'],
          ],
          note: 'Map win rate: 13 ÷ 17 = 76.5%. Series after the opening BO1: 6 ÷ 6 = 100%.',
        },
      },
      {
        number: '03',
        eyebrow: 'Roster distribution',
        title: 'Spirit are not balanced—and that is not the same as being fragile.',
        paragraphs: [
          'The three-month player sample describes a steeply shaped roster. donk posted a 1.43 Rating 3.0 with 0.93 kills and 0.67 deaths per round. sh1ro supplied the second positive engine at 1.16, 0.74 KPR and 0.55 DPR. The remaining three players sat near or just below 1.00. This is not five equal sources of output; it is a superstar, an unusually efficient AWPer, and a support structure built to preserve their leverage.',
          'Concentration creates a valid concern: if the top pair regress, does the entire team collapse? The EWC final is evidence against the strongest version of that criticism. zont1x produced a 1.19 rating and tN1R 1.10 across four maps; Spirit won despite sh1ro posting only 60.6 ADR and magixx finishing negative. Their ceiling still came from donk, but the championship did not require every veteran to peak at once.',
          'The correct statistical description is therefore “star-dependent but not single-point dependent.” donk raises the expected round value more than any teammate. Yet the supporting cast can redistribute output across a long series, which is precisely what a title contender needs when a best-of-five exposes every weak map and every quiet player.',
        ],
        bars: [
          { label: 'donk', value: 100, display: '1.43', detail: '0.93 KPR / 0.67 DPR' },
          { label: 'sh1ro', value: 81, display: '1.16', detail: '0.74 KPR / 0.55 DPR' },
          { label: 'tN1R', value: 71, display: '1.01', detail: 'three-month Rating 3.0' },
          { label: 'zont1x', value: 70, display: '1.00', detail: 'three-month Rating 3.0' },
          { label: 'magixx', value: 68, display: '0.97', detail: 'three-month Rating 3.0' },
        ],
        callout: 'A 1.43–1.16 top-two creates a 0.27 rating gap. The roster’s shape is asymmetric by design; the test is whether the lower three keep supplying situational impact.',
      },
      {
        number: '04',
        eyebrow: 'Map-pool evidence',
        title: 'A favourite becomes credible when the veto has no obvious escape hatch.',
        paragraphs: [
          'Spirit’s most defensible recent maps are Ancient and Anubis. Over the published three-month window they were 6–0 on Ancient and 7–1 on Anubis. On Ancient they converted 81.6% of rounds after the first kill and still won 35.7% after conceding it. Anubis produced 76.0% and 36.8% respectively. Those recovery rates matter because opening-kill conversion alone can flatter a mechanically superior team; winning more than one third of disadvantaged rounds indicates real mid-round resistance.',
          'But perfect-looking percentages should be read with their denominators attached. Six Ancient maps are not enough to infer a true 100% win probability. A simple Wilson 95% interval for 6–0 is roughly 61% to 100%, wide enough to reject certainty. The 7–1 Anubis record is 87.5%, but its approximate Wilson interval is about 53% to 98%. Both are excellent observed records; neither is a law of nature.',
          'The veto argument is therefore comparative rather than absolute. Opponents cannot merely wait for Spirit’s “real level” to appear. They must choose which high-confidence map to concede, then survive a player who is producing 0.26 more kills than deaths per round across the broader three-month sample.',
        ],
        table: {
          caption: 'Recent map indicators',
          headers: ['Map', 'Record', 'Observed win rate', 'After first kill', 'After first death'],
          rows: [
            ['Ancient', '6–0', '100.0%', '81.6%', '35.7%'],
            ['Anubis', '7–1', '87.5%', '76.0%', '36.8%'],
          ],
          note: 'Three-month window. Small samples make the observed rates descriptive, not precise estimates of future win probability.',
        },
      },
      {
        number: '05',
        eyebrow: 'The limit of the claim',
        title: 'The numbers crown a current number one, not an era.',
        paragraphs: [
          'The counter-case is straightforward. Spirit have two titles in 2026, but they lost the IEM Rio final to Vitality, lost the BLAST Bounty final 1–3 to MOUZ only three weeks before EWC, and exited the Cologne Major in the semi-final. One win over Vitality ends a streak; it does not erase the six defeats that created it. A 7–0 current match streak can vanish in one bad weekend.',
          'That history does not disqualify Spirit from being best. It prevents a stronger, less supportable claim: that their superiority is settled across formats and opponents. An era requires repeated title conversion, a durable positive record against the closest rivals, and preferably a Major. Spirit currently own the predictive crown. They do not yet own historical closure.',
          'So the verdict is yes, with a deliberately short expiry date. Ranking first, winning 85.7% of recent series, reaching four of five recent finals and converting EWC is enough to place Spirit at the front. The next question is not whether the Paris trophy was real. It is whether the same statistical shape survives when every opponent begins the next event by preparing specifically for it.',
        ],
        callout: 'Best team now: supported. Best team of 2026: arguable. A Spirit era: not yet demonstrated.',
      },
    ],
    sources: [
      { label: 'HLTV — Spirit team overview', url: 'https://www.hltv.org/team/7020/spirit', use: 'Rank, recent series win rate, results and map indicators.' },
      { label: 'HLTV — Spirit beat FUT to win EWC', url: 'https://www.hltv.org/news/45377/spirit-beat-fut-3-1-to-win-esports-world-cup', use: 'Final scores, title count and tournament narrative.' },
      { label: 'HLTV — EWC grand final live report', url: 'https://www.hltv.org/news/45370/esports-world-cup-grand-final-as-it-happened', use: 'Player K–D, ADR, KAST and Rating 3.0.' },
      { label: 'BLAST — EWC match results', url: 'https://blast.tv/cs/tournaments/esports-world-cup-2026-cs2/match', use: 'Complete event route and match results.' },
    ],
  },
  {
    slug: 'how-spirit-finally-solved-vitality',
    number: '027',
    title: 'How Spirit Finally Solved Vitality',
    shortTitle: 'Spirit vs Vitality',
    dek: 'A six-series curse ended 2–1, but the aggregate score hides the mechanism: two maps at parity, one decider blown apart, and an extraordinary concentration of output.',
    verdict: 'They solved the match, not yet the matchup.',
    verdictDetail: 'Spirit’s resilience carried the series to Mirage; donk and tN1R then made the decider non-competitive. That is a convincing win and a plausible tactical breakthrough, but one series cannot establish a stable reversal.',
    readingMinutes: 14,
    publishedAt: '2026-08-28',
    dataCutoff: '28 August 2026',
    sample: 'The EWC quarter-final on 21 August 2026, placed against the preceding six-series Vitality streak dating to October 2024.',
    heroStats: [
      { value: '0–6', label: 'Previous series streak', detail: 'Spirit had not beaten Vitality since October 2024' },
      { value: '40–30', label: 'Round score', detail: 'Spirit across Anubis, Nuke and Mirage' },
      { value: '70–43', label: 'donk K–D', detail: '+27 with 101.0 ADR and 1.46 rating' },
      { value: '13–3', label: 'Mirage decider', detail: 'A ten-round margin after 27–27 across maps one and two' },
    ],
    sections: [
      {
        number: '01',
        eyebrow: 'The streak',
        title: 'Six losses create a story. They do not create a permanent law.',
        paragraphs: [
          'Vitality had beaten Spirit in six consecutive series stretching back to October 2024. The run included the 2025 Katowice final, where Vitality won 3–0, and repeated close-series confirmations afterward. By EWC, “Vitality own Spirit” was no longer only fan shorthand; it was the most relevant prior in the matchup.',
          'But a streak is a sequence, not a causal explanation. Rosters change, form changes, maps rotate, and the same pairing can contain both blowouts and coin-flip endings. The analytical question is not whether the seventh result contradicted the first six. It is which parts of the new series looked structurally different enough to be repeatable.',
          'The answer begins with a negative finding: Spirit did not suddenly dominate the whole match. Anubis finished 13–11, Nuke 14–16, and the combined score after two maps was exactly 27–27. The entire ten-round series margin was created on Mirage. “Solved” therefore means Spirit remained alive long enough to force the matchup onto the one map where their highest-variance weapon could decide it.',
        ],
        table: {
          caption: 'The series, map by map',
          headers: ['Map', 'Spirit', 'Vitality', 'Margin', 'Reading'],
          rows: [
            ['Anubis', '13', '11', '+2 Spirit', 'Spirit pick; closed in regulation'],
            ['Nuke', '14', '16', '+2 Vitality', 'Vitality pick; Spirit forced overtime'],
            ['Mirage', '13', '3', '+10 Spirit', 'Decider; 9–3 at half'],
            ['Total', '40', '30', '+10 Spirit', '100% of net margin came on Mirage'],
          ],
          note: 'Across the two teams’ picks: 27–27. On the neutral decider: 13–3 Spirit.',
        },
      },
      {
        number: '02',
        eyebrow: 'Survival before solution',
        title: 'Spirit changed the emotional state of the series by refusing to leave it.',
        paragraphs: [
          'On Anubis, Spirit’s six-round first half was enough because their T side produced a 5–0 run and tN1R closed the final round with a triple. On Nuke, they fell behind 7–1, trailed by four map points, and still forced overtime. They lost the map, but made Vitality spend every available round and every available reset to win it.',
          'This matters statistically and psychologically. A 16–14 loss contributes zero maps to the series score, yet it preserves information about competitiveness that a binary win/loss discards. Across Anubis and Nuke, neither team held an aggregate round advantage. Spirit arrived at Mirage after losing a map, but not after being outplayed across the preceding 54 rounds.',
          'Counter-Strike analysis often overvalues closure and undervalues resistance. Spirit’s critical improvement was not converting every lead; they nearly failed to close Anubis and did fail to complete the Nuke comeback. It was keeping the expected value of the next round high enough that a single dominant half could still determine the series.',
        ],
        stats: [
          { value: '7–1', label: 'Early Nuke deficit', detail: 'Vitality began on the T side at full speed' },
          { value: '4', label: 'Map points erased', detail: 'Spirit forced overtime before losing 14–16' },
          { value: '27–27', label: 'Two-map aggregate', detail: 'Parity before the decider' },
        ],
        callout: 'The second map was a loss in the bracket and a success in keeping the contest statistically live.',
      },
      {
        number: '03',
        eyebrow: 'The output concentration',
        title: 'donk did not merely top-frag. He bent the distribution.',
        paragraphs: [
          'donk finished 70–43, with 101.0 ADR, 82.9% KAST and a 1.46 Rating 3.0. tN1R added 63–45 and a 1.21 rating. Together they generated a raw +45 K–D differential. The other three Spirit players combined for –3. This is a remarkably concentrated explanation of a 2–1 win.',
          'The comparison with Vitality’s stars is equally stark. ZywOo finished 51–48 with a 1.07 rating; flameZ led Vitality at 1.15. donk’s rating advantage over ZywOo was 0.39, and his ADR advantage was 24.6. The team-average rating was approximately 1.18 for Spirit against 0.94 for Vitality, a gap of 0.24 per player.',
          'At the bottom of Vitality’s distribution, apEX went 27–60 with 51.4 ADR, 55.7% KAST and a 0.52 rating. It would be wrong to convert that line directly into a tactical claim about every site or call. It is enough to say that Vitality carried a severe low-tail result while Spirit’s bottom rating was still 1.03. One team’s fifth result remained neutral; the other’s became an enormous drag.',
        ],
        table: {
          caption: 'Series player output',
          headers: ['Player', 'Team', 'K–D', 'ADR', 'KAST', 'Rating 3.0'],
          rows: [
            ['donk', 'Spirit', '70–43 (+27)', '101.0', '82.9%', '1.46'],
            ['tN1R', 'Spirit', '63–45 (+18)', '84.1', '72.9%', '1.21'],
            ['sh1ro', 'Spirit', '46–38 (+8)', '71.9', '78.6%', '1.18'],
            ['flameZ', 'Vitality', '51–57 (–6)', '82.4', '72.9%', '1.15'],
            ['ZywOo', 'Vitality', '51–48 (+3)', '76.4', '72.9%', '1.07'],
            ['apEX', 'Vitality', '27–60 (–33)', '51.4', '55.7%', '0.52'],
          ],
          note: 'Selected rows show the top of Spirit’s distribution and the key spread in Vitality’s. Full team averages: Spirit ≈1.18 rating and 77.5% KAST; Vitality ≈0.94 and 68.6%.',
        },
      },
      {
        number: '04',
        eyebrow: 'The Mirage rupture',
        title: 'One half turned a close series into a historical correction.',
        paragraphs: [
          'donk went 20–5 in the first half of Mirage: four kills for every death, across only 12 rounds. Spirit reached the break 9–3 and closed 13–3, including the final round from a 3v5 disadvantage. The decider accounted for 25% of the series’ rounds but 100% of Spirit’s net round differential.',
          'That concentration is why the map should be interpreted in two ways at once. It is decisive evidence that Spirit can break Vitality on a neutral map under elimination pressure. It is also high-variance evidence: a 20–5 half from the best rifler in the world is not a baseline that a tactical model can simply schedule for the next meeting.',
          'The repeatable layer sits beneath the superstar performance. Spirit reached Mirage without tilting after losing Nuke in overtime, gave donk repeated opportunities to take initiative, and had tN1R sustaining pressure across the full series. Individual brilliance was the visible result; the structure’s job was to keep the game state receptive to it.',
        ],
        bars: [
          { label: 'Map 1 — Anubis', value: 60, display: '+2', detail: 'Spirit round margin' },
          { label: 'Map 2 — Nuke', value: 40, display: '−2', detail: 'Spirit round margin' },
          { label: 'Map 3 — Mirage', value: 100, display: '+10', detail: 'Spirit round margin' },
        ],
        callout: 'Mirage was both the proof and the warning: an overwhelming answer, delivered through a performance too extreme to assume will repeat.',
      },
      {
        number: '05',
        eyebrow: 'What “solved” should mean',
        title: 'A matchup is solved only when the answer survives the rematch.',
        paragraphs: [
          'There are three plausible interpretations. The weakest is pure variance: donk produced an outlier half and Spirit happened to win the close map. The middle interpretation is matchup progress: Spirit’s resilience, T-side Anubis and willingness to reach Mirage created a better distribution of possible outcomes. The strongest is a durable solution: Spirit have found a repeatable veto and game-plan edge that will remain after Vitality reviews the demos.',
          'The evidence strongly rejects the idea that nothing changed, but it cannot yet distinguish the middle from the strongest interpretation. The sample contains one new series and three maps. A rough binomial view makes the limitation obvious: moving from 0–6 to 1–6 changes the observed Spirit series rate from 0% to 14.3%, but the interval around seven trials remains enormous and is not a useful estimate of the next match.',
          'The most honest verdict is therefore narrower than the title. Spirit solved the EWC quarter-final by reaching the decider at parity and then weaponising the largest individual gap in the server. To prove they solved Vitality, they must reproduce the conditions after Vitality has had time to remove them.',
        ],
        callout: 'The next series is not merely another result. It is the first out-of-sample test of the proposed solution.',
      },
    ],
    sources: [
      { label: 'HLTV — Spirit snap six-match losing streak', url: 'https://www.hltv.org/news/45360/spirit-snap-six-match-losing-streak-vs-vitality-to-reach-ewc-semis', use: 'Map scores, series account, player output and prior streak.' },
      { label: 'HLTV — Spirit team overview', url: 'https://www.hltv.org/team/7020/spirit', use: 'Context for current form and subsequent title run.' },
      { label: 'HLTV — Spirit win EWC', url: 'https://www.hltv.org/news/45377/spirit-beat-fut-3-1-to-win-esports-world-cup', use: 'Downstream validation: the quarter-final win led to the title.' },
    ],
  },
  {
    slug: 'fut-esports-cinderella-run-or-tier-one-arrival',
    number: '028',
    title: 'FUT Esports: Cinderella Run or the Arrival of a Tier-One Team?',
    shortTitle: 'The FUT arrival test',
    dek: 'A first Big Event final can be variance. Beating the same elite opponent three times, winning a LAN title and surviving pressure in different ways looks more like a team changing tiers.',
    verdict: 'Arrival—with conditions.',
    verdictDetail: 'FUT are already a legitimate tier-one participant. They are not yet a permanent title favourite. The difference will be decided by repeat deep runs and whether their map pool survives targeted preparation.',
    readingMinutes: 15,
    publishedAt: '2026-08-28',
    dataCutoff: '28 August 2026',
    sample: 'FUT’s complete EWC 2026 run, repeat matches against MOUZ, 2026 title/placement context and available team map history.',
    heroStats: [
      { value: '#14', label: 'EWC entering rank', detail: 'HLTV rank shown during the event' },
      { value: '5–1', label: 'EWC series record', detail: 'Undefeated until the grand final' },
      { value: '10–6', label: 'EWC map record', detail: '62.5% across 16 maps' },
      { value: '3 straight', label: 'Series wins vs MOUZ', detail: 'Including twice in Paris' },
    ],
    sections: [
      {
        number: '01',
        eyebrow: 'The threshold',
        title: 'A Cinderella run is one surprising path. Arrival is repeatable resistance.',
        paragraphs: [
          'Underdog tournament runs are produced by a mixture of real improvement and favourable variance. A short format can amplify pistol rounds, clutches and veto surprises. One elite opponent may arrive cold. A bracket may remove a nightmare matchup. The final placement alone cannot tell us which mechanism occurred.',
          'FUT’s Paris run contains more signal than a typical Cinderella story because it repeats its hardest result. They beat MOUZ 2–1 in the group stage, then swept them 2–0 in the quarter-final after MOUZ changed its veto in response to the previous losses. HLTV reported the sweep as FUT’s third consecutive series win over MOUZ. The opponent had information, changed the map path, and lost more decisively.',
          'FUT then beat FURIA 2–1 to reach their first Big Event final. That matters in the context of a first full tier-one year that already included a PGL Bucharest title and fourth place at ESL Pro League Season 23 Finals. Paris was a breakthrough in event category, not the first appearance of competitive strength.',
        ],
        stats: [
          { value: '1st', label: 'PGL Bucharest 2026', detail: 'FUT’s first notable LAN trophy of the year' },
          { value: '4th', label: 'EPL Season 23 Finals', detail: 'Best Big Event result before Paris' },
          { value: '2nd', label: 'EWC 2026', detail: 'First Big Event grand final' },
        ],
        callout: 'The strongest evidence of arrival is not the final. It is an elite opponent adapting to FUT and still losing a third consecutive series.',
      },
      {
        number: '02',
        eyebrow: 'The tournament ledger',
        title: 'FUT won 62.5% of maps and reached the final undefeated.',
        paragraphs: [
          'Across the available event ledger, FUT went 5–1 in matches and 10–6 on maps. Before meeting Spirit, they were 5–0 and 9–3: a 75% map win rate. The final reduced the full-event figure to 62.5%, but the route had already required two series against MOUZ and a semi-final against FURIA.',
          'The round-level view is more revealing than the series labels. Across the two EWC matches against MOUZ, FUT won 67 rounds to 51, a +16 margin over five maps. Against FURIA they won the series despite losing the aggregate round count 35–37, because two close map wins surrounded a 6–13 Nuke. Against Spirit they lost 45–55, with three competitive maps followed by a 5–13 Nuke.',
          'Combining the two MOUZ meetings, FURIA and Spirit produces 12 maps and a 147–143 round score for FUT. The team was only +4 rounds across that elite subset despite winning three of four series. That is not dominance. It is evidence of high leverage: FUT concentrated enough rounds into the maps that decided series, while accepting that individual maps could get away from them.',
        ],
        table: {
          caption: 'FUT’s EWC route',
          headers: ['Stage', 'Opponent', 'Series', 'Known map score', 'Round differential'],
          rows: [
            ['Opening BO1', 'TYLOO', '1–0', '1–0 maps', '—'],
            ['Group', 'MOUZ', '2–1', '13–6, 12–16, 13–11', '+5'],
            ['Group', 'magic', '2–1', '2–1 maps', '—'],
            ['Quarter-final', 'MOUZ', '2–0', '16–13, 13–5', '+11'],
            ['Semi-final', 'FURIA', '2–1', '13–11, 6–13, 16–13', '−2'],
            ['Final', 'Spirit', '1–3', '13–10, 13–16, 14–16, 5–13', '−10'],
            ['Total', 'Six series', '5–1', '10–6 maps', 'Partial ledger'],
          ],
          note: 'The +4 round figure in the prose uses only the 12 maps with complete published scores: both MOUZ series, FURIA and Spirit. The TYLOO and magic round totals are excluded rather than estimated.',
        },
      },
      {
        number: '03',
        eyebrow: 'Repeat-opponent analysis',
        title: 'MOUZ is the control group FUT accidentally created.',
        paragraphs: [
          'Single upsets are difficult to interpret because opponent form and veto surprise are confounded with the underdog’s quality. Repeated matches against the same opponent reduce—though never eliminate—that ambiguity. FUT’s sequence against MOUZ is therefore the most important part of the case.',
          'In the EWC group match, FUT won 2–1 and 38–33 on rounds. MOUZ recovered from 3–9 on Nuke and won it 16–12, then nearly repeated the comeback on Mirage before FUT closed 13–11. The quarter-final rematch looked different: MOUZ changed its pick away from Nuke, led Dust2 5–0, and still lost 16–13 before being dismantled 13–5 on Ancient.',
          'The rematch improved FUT’s map margin from +1 to +2 and its round margin from +5 to +11. Across both Paris meetings FUT went 4–1 on maps and +16 on rounds. More importantly, the second victory came after the opponent received a fresh demo set and changed the veto. That is the closest observational esports gets to an out-of-sample tactical test.',
        ],
        bars: [
          { label: 'MOUZ — group', value: 58, display: '2–1', detail: '+5 rounds for FUT' },
          { label: 'MOUZ — quarter-final', value: 100, display: '2–0', detail: '+11 rounds for FUT' },
          { label: 'Paris aggregate', value: 82, display: '4–1', detail: '67–51 rounds for FUT' },
        ],
        callout: 'Preparation did not shrink the result. The rematch doubled FUT’s round margin and removed MOUZ’s map win.',
      },
      {
        number: '04',
        eyebrow: 'Pressure and frag distribution',
        title: 'Different players carried different elimination matches.',
        paragraphs: [
          'Against MOUZ in the quarter-final, all five FUT players rated at least 1.10. xfl0ud led with 1.48 and 99.9 ADR; the lowest line was dziugss at 1.10. That is the statistical shape of a clean team win: a narrow floor and no passenger.',
          'The FURIA semi-final redistributed the load. cmtry led at 1.16 and +14 K–D, xfl0ud posted 1.15, and dem0n 1.11; Krabeni and dziugss fell below 1.00. FUT still recovered two 3v5s, a 2v4 and an overtime 4v2 on the Dust2 decider. Some of that is clutch variance, but the identity of the leading player changed without the series collapsing.',
          'In the final, dem0n was the only FUT player with a strongly positive line: 77–66, 80.9 ADR, 78.0% KAST and 1.18 rating. cmtry fell to 0.78 and 51.3 ADR; xfl0ud to 0.89. Spirit’s top three all exceeded 1.10. The final therefore exposes FUT’s remaining gap: their distributed ceiling is real, but against the very best opponent their floor can separate violently from it over four maps.',
        ],
        table: {
          caption: 'How FUT’s leading output moved through the playoffs',
          headers: ['Series', 'Leader', 'Rating', 'ADR', 'Team floor', 'Result'],
          rows: [
            ['vs MOUZ', 'xfl0ud', '1.48', '99.9', '1.10', '2–0'],
            ['vs FURIA', 'cmtry', '1.16', '66.9', '0.85', '2–1'],
            ['vs Spirit', 'dem0n', '1.18', '80.9', '0.78', '1–3'],
          ],
          note: '“Team floor” is the lowest FUT player Rating 3.0 in that series. It measures distribution spread, not tactical value.',
        },
      },
      {
        number: '05',
        eyebrow: 'Map pool and regression risk',
        title: 'The next tier is defended through the veto, not declared on stage.',
        paragraphs: [
          'FUT’s long-run team page shows a powerful historical Mirage record—53–18, or 74.6%—and Ancient at 34–22, or 60.7%. Dust2 and Nuke sit near 50%, while Inferno and Anubis are below 45%. Those samples span more than the exact current roster and should not be mistaken for a clean five-player forecast, but they describe the organisation’s inherited map tendencies.',
          'Paris showed both map-pool imagination and risk. FUT picked Cache in the final despite never having played it officially and won 13–10. That is excellent anti-preparation value. They then came within overtime margins on Anubis and Ancient before Nuke collapsed 5–13. Surprise can buy one map; remaining tier one requires enough stable maps that opponents cannot remove the entire comfort zone in two bans.',
          'Regression is now the central threat. Before EWC, teams prepared for FUT as an emerging #14. After EWC, every elite opponent has a current demo library and a reason to treat them seriously. Their future win rate may fall even if their underlying level improves, simply because schedule strength and opponent preparation rise. That is why top-eight placements over the next three events are more informative than demanding another immediate final.',
        ],
        table: {
          caption: 'FUT team-history map profile',
          headers: ['Map', 'Record', 'Win rate', 'Interpretation'],
          rows: [
            ['Mirage', '53–18', '74.6%', 'Historical foundation'],
            ['Ancient', '34–22', '60.7%', 'Positive long-run map'],
            ['Nuke', '17–16', '51.5%', 'Approximately neutral'],
            ['Dust2', '26–26', '50.0%', 'Approximately neutral'],
            ['Inferno', '—', '44.4%', 'Historical weakness'],
            ['Anubis', '—', '41.7%', 'Historical weakness'],
          ],
          note: 'HLTV team-history data include prior lineups. They are context for organisational tendencies, not a roster-specific confidence interval.',
        },
      },
      {
        number: '06',
        eyebrow: 'The arrival test',
        title: 'Tier one is a schedule you can survive repeatedly.',
        paragraphs: [
          'FUT do not need to win the argument by semantics. They already beat MOUZ three times in succession, won PGL Bucharest, finished fourth at EPL and second at EWC. Calling all of that a Cinderella run requires ignoring the repeated evidence because the organisation’s name is newer than its results.',
          'Nor should one final make them an automatic championship favourite. The EWC elite subset was separated by only four aggregate rounds across 12 fully scored maps. The FURIA win depended on multiple disadvantage conversions. The Spirit final showed a widening player floor and a decisive Nuke failure. These are not reasons to dismiss FUT; they are exactly the margins a newly arrived tier-one team still has to stabilise.',
          'The prospective test is simple and falsifiable. Over the next three comparable LANs, reach at least two playoffs, maintain competitive series against top-ten opposition, and avoid becoming a one- or two-map veto. If that happens, Paris will look like the moment the public caught up. If it does not, EWC remains an extraordinary peak. Based on the evidence available now, arrival is the better prior.',
        ],
        callout: 'Cinderella explains surprise. It does not explain repeat wins after adaptation. FUT have crossed the participation threshold; consistency will decide whether they remain there.',
      },
    ],
    sources: [
      { label: 'HLTV — FUT sweep MOUZ', url: 'https://www.hltv.org/news/45355/fut-sweep-mouz-to-make-ewc-semis', use: 'Rematch scores, third consecutive MOUZ win and player statistics.' },
      { label: 'HLTV — FUT deny MOUZ comeback', url: 'https://www.hltv.org/news/45303/fut-deny-mouz-comeback-to-secure-ewc-playoffs', use: 'Group-stage map scores and match flow.' },
      { label: 'HLTV — FUT outlast FURIA', url: 'https://www.hltv.org/news/45367/fut-outlast-furia-to-secure-first-big-event-grand-final-appearance', use: 'Semi-final scores, pressure rounds and prior event context.' },
      { label: 'HLTV — Spirit beat FUT in EWC final', url: 'https://www.hltv.org/news/45377/spirit-beat-fut-3-1-to-win-esports-world-cup', use: 'Final scores, player distribution and first-final context.' },
      { label: 'HLTV — FUT map statistics', url: 'https://www.hltv.org/stats/teams/maps/13286/fut?csVersion=CS2', use: 'Long-run team map records and first-kill conversion context.' },
    ],
  },
  {
    slug: 'vitality-astralis-greatest-team-of-all-time',
    number: '029',
    title: 'Vitality, Astralis, and the Greatest Team of All Time',
    shortTitle: 'Vitality vs Astralis',
    dek: 'Vitality own the stronger peak and the finest single season. Astralis still own the longer reign, the deeper Major run and the game’s most consequential dynasty. Which evidence should decide “greatest”?',
    verdict: 'Astralis—by the narrowest defensible margin.',
    verdictDetail: 'Post-ropz Vitality are the best peak team Counter-Strike has measured and produced the strongest single year. Astralis remain the greatest complete team because three consecutive Majors, 58 weeks at number one, greater same-roster volume and strategic influence still outweigh Vitality’s statistical peak.',
    readingMinutes: 19,
    publishedAt: '2026-08-28',
    dataCutoff: '28 August 2026',
    sample: 'Vitality from ropz’s January 2025 debut through EWC 2026; Astralis’ Magisk roster, with the competitive dynasty window defined as April 2018–December 2019. Online-era extensions are separated from the primary comparison.',
    heroStats: [
      { value: '14–16', label: 'Trophies in comparable windows', detail: 'Vitality 2025–Aug 2026 vs Astralis 2018–2019' },
      { value: '2–3', label: 'Majors', detail: 'Both runs include back-to-back titles; Astralis reached three straight' },
      { value: '80.8–77.6%', label: 'Peak map win rate', detail: 'Vitality lead by 3.2 points; uncertainty intervals overlap' },
      { value: '37–14', label: 'Peak series streak', detail: 'Vitality’s BO3/BO5 run vs Astralis’ all-format run' },
    ],
    sections: [
      {
        number: '01',
        eyebrow: 'Rules before rankings',
        title: '“Greatest” contains at least three different questions.',
        paragraphs: [
          'The greatest-team debate usually begins with evidence and only later reveals its definition. One person means the five players who reached the highest level for three months. Another means the roster with the largest collection of championships. A third means the team that changed how elite Counter-Strike was played. All three can use accurate statistics and still argue past one another.',
          'This analysis separates peak, season and dynasty. Peak asks which team produced the strongest concentrated run. Season asks which roster assembled the best calendar-year résumé. Dynasty asks which team combined dominance, championship conversion, longevity, Major performance and influence for long enough that opponents had to reorganise around it.',
          'The final “greatest” verdict uses dynasty as the controlling definition. That is not because longevity should automatically defeat quality. It is because greatness is cumulative: the team must reach an extraordinary level, survive adaptation and reproduce it at the most important events. Peak remains independently reported so that the winner cannot borrow longevity to erase a higher observed ceiling.',
        ],
        stats: [
          { value: 'Peak', label: 'Best concentrated run', detail: 'Eight-event and map-level dominance' },
          { value: 'Season', label: 'Best twelve months', detail: 'Titles, Majors, floor and repeatability' },
          { value: 'Dynasty', label: 'GOAT criterion', detail: 'Peak × duration × championship conversion × influence' },
        ],
        callout: 'The answer used here: Vitality own peak and season. Astralis retain dynasty—and therefore GOAT—unless “greatest” is defined as “highest observed level.”',
      },
      {
        number: '02',
        eyebrow: 'Era boundaries',
        title: 'Compare equal windows, then show the whole roster life.',
        paragraphs: [
          'Vitality’s relevant roster begins in January 2025, when ropz replaced Spinx alongside apEX, ZywOo, flameZ and mezii. By the cut-off it had won nine trophies in 2025 and five in 2026: 14 across roughly 20 months. The collection includes the Austin and Budapest Majors, two ESL Grand Slams and an uninterrupted run of seven tournament victories in the first half of 2025.',
          'Astralis’ Magisk five begins in February 2018. Its clean dynasty window runs from the first title at DreamHack Masters Marseille in April 2018 through the dominant end of 2019: 10 trophies in 2018 and six in 2019. The roster won the London, Katowice and Berlin Majors consecutively and completed the first Intel Grand Slam. It also remained together beyond that window, interrupted by player leave and the online era, until 2021.',
          'Using the comparable 2018–2019 and 2025–August 2026 windows gives Astralis a 16–14 trophy lead and a 3–2 Major lead. Using complete same-roster history widens Astralis’ evidence base: HLTV records 570 maps and 31 LAN top-three placements for the Magisk five. Vitality’s current lineup page records 312 maps and 20 LAN top-three finishes. Vitality have accumulated faster; Astralis have accumulated longer.',
        ],
        table: {
          caption: 'Comparable dynasty ledger at the data cut-off',
          headers: ['Measure', 'Vitality + ropz', 'Astralis + Magisk', 'Edge'],
          rows: [
            ['Primary window', 'Jan 2025–Aug 2026', 'Apr 2018–Dec 2019', 'Comparable ≈20 months'],
            ['Trophies', '14', '16', 'Astralis'],
            ['Majors', '2', '3', 'Astralis'],
            ['Consecutive Majors', '2', '3', 'Astralis'],
            ['Grand Slams', '2', '1', 'Vitality'],
            ['Same-lineup maps', '312', '570', 'Astralis volume'],
            ['Same-lineup map record', '234–78', '419–1–150', 'Vitality rate'],
            ['LAN top-three finishes', '20', '31', 'Astralis'],
          ],
          note: 'Trophies use the published event ledgers for the primary windows. Same-lineup totals extend across each roster’s complete recorded life and therefore answer a different, cumulative question.',
        },
      },
      {
        number: '03',
        eyebrow: 'Peak versus peak',
        title: 'Vitality win the cleanest direct statistical comparison.',
        paragraphs: [
          'HLTV’s eight-LAN comparison places Vitality’s first half of 2025 against Astralis’ second half of 2018. Vitality won seven of eight events, an 87.5% conversion rate. Astralis won six of eight, or 75%. Vitality went 76–18 on maps for 80.8%; Astralis went 66–19 for 77.6%. Vitality’s worst played map was Anubis at 66.7%, while Astralis’ second tier fell to 54.5% on Overpass and 57.5% on Train despite an extraordinary 12–0 Nuke.',
          'The streak difference is larger. Vitality won 30 consecutive matches, then extended its best-of-three/best-of-five streak to 37 before MOUZ ended it in Cologne. Astralis’ comparable run reached 14 matches, eight of them best-of-threes. Tournament format explains part of the gap—2018 used more best-of-ones—but not all of it.',
          'Vitality also had the cleaner record against its nearest challengers. Against MOUZ, Falcons and Spirit it went 14–0 in series and 34–10 on maps. Astralis went 11–3 against Liquid, NAVI and FaZe, with one best-of-one loss to each and a 20–6 map record. Fascinatingly, the map rates are almost identical: 77.3% for Vitality and 76.9% for Astralis. Vitality’s advantage is series closure, not a fundamentally larger per-map gap against the elite.',
        ],
        table: {
          caption: 'Eight-event peak comparison',
          headers: ['Measure', 'Vitality 2025', 'Astralis 2018', 'Difference'],
          rows: [
            ['Events won', '7 / 8', '6 / 8', '+12.5 pp Vitality'],
            ['Maps', '76–18', '66–19', '+10 net wins Vitality'],
            ['Map win rate', '80.8%', '77.6%', '+3.2 pp Vitality'],
            ['Peak match streak', '30 all-format / 37 BO3+', '14 all-format / 8 BO3', 'Vitality'],
            ['Series vs three challengers', '14–0', '11–3', 'Vitality'],
            ['Maps vs three challengers', '34–10 (77.3%)', '20–6 (76.9%)', '+0.4 pp Vitality'],
          ],
          note: 'Percentage points are not percentages of the opposing value. Challenger sets are era-relative and selected by contemporaneous competitive proximity.',
        },
        callout: 'If “best ever” means the highest sustained level across one tournament season, the answer is post-ropz Vitality.',
      },
      {
        number: '04',
        eyebrow: 'Statistical restraint',
        title: 'The observed map-rate lead is real—and nowhere near statistically decisive.',
        paragraphs: [
          'Vitality’s 80.8% peak map rate exceeds Astralis’ 77.6% by 3.2 percentage points. Under a deliberately simple binomial model, the 95% Wilson interval is approximately 71.7–87.5% for Vitality and 67.7–85.2% for Astralis. The intervals overlap heavily. A naïve normal interval for the difference spans roughly –8.7 to +15.1 points. The data support “Vitality observed higher”; they do not support “Vitality’s true peak map probability was proven higher.”',
          'The broader same-roster numbers are even closer. Vitality’s current 234–78 record is exactly 75.0%; Astralis’ 419–150 record excluding the draw is 73.6%. The difference is about 1.4 points. Wilson intervals are approximately 69.9–79.5% and 69.7–77.0%. Again, there is no clean statistical separation.',
          'Even those intervals are too confident because maps are not independent coin flips. They are clustered within series and events; vetoes select favourable matchups; opponents recur; patches and rosters change; a team’s form is autocorrelated. A hierarchical model would widen uncertainty. Statistics can stop a false precision claim here, but they cannot manufacture a cross-version experiment that history never ran.',
        ],
        table: {
          caption: 'Win-rate uncertainty, descriptive binomial model',
          headers: ['Sample', 'Vitality', '95% Wilson interval', 'Astralis', '95% Wilson interval'],
          rows: [
            ['Eight-event peak maps', '76 / 94 = 80.8%', '71.7–87.5%', '66 / 85 = 77.6%', '67.7–85.2%'],
            ['Complete lineup maps', '234 / 312 = 75.0%', '69.9–79.5%', '419 / 569 = 73.6%', '69.7–77.0%'],
            ['Peak event conversion', '7 / 8 = 87.5%', '52.9–97.8%', '6 / 8 = 75.0%', '40.9–92.9%'],
          ],
          note: 'Astralis’ complete lineup record contains one draw, excluded from the rate denominator. Wilson intervals illustrate sampling uncertainty only; dependence and era-selection bias remain.',
        },
      },
      {
        number: '05',
        eyebrow: 'The single-season case',
        title: 'Vitality’s 2025 is the strongest calendar year on record.',
        paragraphs: [
          'Vitality attended 16 Big Events in 2025, won nine, made every playoff and finished worse than fourth only once. The year contained 15 consecutive semi-final appearances, seven consecutive tournament wins, two Majors, one Grand Slam and the strongest first-half streak in modern Counter-Strike. ZywOo won eight MVPs and both Major MVPs in the same calendar year.',
          'Astralis’ 2018 produced more trophies—10—but only one Major. Their 2019 produced six trophies and two Majors. Splitting the dynasty by calendar year reveals why the answer changes by category: Astralis distributed its most important championships across a longer span, while Vitality compressed two Majors and nine total wins into one season.',
          'A crude title rate gives Vitality 9/16, or 56.3%, across 2025 Big Events. The more important floor is 16/16 playoffs. The early streak was not the whole year: after a post-break decline, Vitality still won EPL Season 22 and the Budapest Major. That recovery converts a historic hot streak into a complete season argument.',
        ],
        stats: [
          { value: '9 / 16', label: '2025 titles', detail: '56.3% of attended Big Events' },
          { value: '16 / 16', label: 'Playoffs reached', detail: 'No event below the playoff line' },
          { value: '15', label: 'Consecutive semi-finals', detail: 'A floor as impressive as the ceiling' },
          { value: '2', label: 'Majors in one year', detail: 'Austin and Budapest, both with ZywOo MVP' },
        ],
        callout: 'Astralis built the greater two-year championship sequence. Vitality built the better single calendar year.',
      },
      {
        number: '06',
        eyebrow: 'The five-player distributions',
        title: 'Vitality have the highest apex; Astralis had the deepest symmetry.',
        paragraphs: [
          'Vitality’s 2025 hierarchy was explicit. ZywOo ranked first in the world, ropz third, flameZ seventh and mezii twelfth. ZywOo’s eight MVPs made the best player the central source of advantage, while ropz supplied a second top-three closer and anchor. The 2026 Rotterdam final demonstrated that the hierarchy could invert: ropz produced a 1.56 rating and won his first Vitality MVP while ZywOo played the secondary star.',
          'Astralis’ 2018 roster placed all five players in HLTV’s Top 20: device second, dupreeh fifth, Magisk seventh, gla1ve eighth and Xyp9x thirteenth. That is a more even distribution of elite recognition, especially because gla1ve combined in-game leadership with top-eight individual output and Xyp9x led Big Events with 77 one-versus-X clutches.',
          'The difference is architectural. Vitality pair the era’s strongest individual with a top-three co-star and create role efficiency around them. Astralis reduced the distance between star, caller, entry and support. Vitality’s model creates the higher maximum; Astralis’ made the fifth-best player unusually difficult to exploit. Both are team systems, but their statistical shapes are different.',
        ],
        table: {
          caption: 'Contemporaneous individual ranking depth',
          headers: ['Roster slot', 'Vitality 2025', 'World rank', 'Astralis 2018', 'World rank'],
          rows: [
            ['Primary star', 'ZywOo', '#1', 'device', '#2'],
            ['Second star', 'ropz', '#3', 'dupreeh', '#5'],
            ['Aggressive rifler', 'flameZ', '#7', 'Magisk', '#7'],
            ['Fourth ranked player', 'mezii', '#12', 'gla1ve', '#8'],
            ['IGL / remaining player', 'apEX', 'Outside Top 20', 'Xyp9x', '#13'],
          ],
          note: 'Roles are simplified to make the distribution legible and are not claimed as one-to-one tactical equivalents.',
        },
      },
      {
        number: '07',
        eyebrow: 'Majors and resistance to adaptation',
        title: 'Astralis’ decisive advantage is what happened after everyone knew.',
        paragraphs: [
          'Vitality’s Austin and Budapest titles are back-to-back Majors and establish a genuine dynasty. Astralis won London 2018, Katowice 2019 and Berlin 2019 consecutively with the Magisk roster. Three straight Majors mean the same core survived two off-seasons, multiple map cycles, months of anti-stratting and three different championship fields without surrendering the most important trophy.',
          'The 58-week uninterrupted run at number one captures the same property at higher frequency. Astralis did not merely peak at each Major; they remained the default benchmark between them. Vitality were unquestionably first in 2025 and began 2026 with five trophies, but entered this cut-off ranked fourth after quarter-final exits and Spirit’s resurgence. Their fall does not invalidate the era. It does make the uninterrupted Astralis reign longer.',
          'Major count should not become a magical statistic that overrides everything else. Majors are sparse and bracket-sensitive. Yet three consecutive wins are precisely the kind of repeated, high-stakes evidence a GOAT model should value most: same roster, maximum preparation, changing opponents and no opportunity to select the event.',
        ],
        bars: [
          { label: 'Vitality Majors', value: 67, display: '2', detail: 'Austin 2025 · Budapest 2025' },
          { label: 'Astralis Majors', value: 100, display: '3', detail: 'London 2018 · Katowice 2019 · Berlin 2019' },
          { label: 'Vitality Grand Slams', value: 100, display: '2', detail: 'First organisation to complete two' },
          { label: 'Astralis Grand Slam', value: 50, display: '1', detail: 'Won the inaugural season' },
        ],
        callout: 'Vitality won more circuit-spanning Grand Slams. Astralis won one more Major and never gave the crown back between three of them.',
      },
      {
        number: '08',
        eyebrow: 'Era adjustment',
        title: 'MR12 makes Vitality’s consistency harder; Astralis’ innovation makes its numbers more consequential.',
        paragraphs: [
          'CS2’s MR12 economy gives a favourite fewer rounds in which superior decision-making can overwhelm pistol variance and a slow start. The international 2025 field also contained mature coaching staffs, broad data access and lineups assembled across national boundaries. Vitality winning 37 consecutive long-form series in that environment is an argument for era-adjusted difficulty.',
          'Astralis faced MR15 and more best-of-one group games, but they were not merely exploiting a softer statistical environment. Their utility damage, coordinated grenade usage, role discipline and systematic conversion of opening advantages changed elite practice. In August 2018 they converted 81.2% of rounds after the opening kill, recovered nearly one third of 4v5s and produced 29.0 utility ADR as a team. Rivals did not just need better aim; they had to learn a new operating model.',
          'Difficulty and influence should remain separate. Vitality may be producing its results in the more variance-heavy, analytically mature version. Astralis deserves credit for helping create that maturity. There is no principled coefficient that turns an MR12 title into 1.13 MR15 titles or converts tactical influence into maps. The honest adjustment is qualitative and symmetric.',
        ],
        callout: 'Vitality receive the difficulty adjustment. Astralis receive the innovation adjustment. Neither is large or measurable enough to erase the championship ledger.',
      },
      {
        number: '09',
        eyebrow: 'The decision matrix',
        title: 'The verdict depends on which question is allowed to break the tie.',
        paragraphs: [
          'Vitality win peak event conversion, peak map rate, long-form series streak, challenger control, Grand Slams and the single-season résumé. Astralis win total trophies in the comparable dynasty window, Major count, consecutive Major count, number-one longevity, full-roster sample, top-three volume, five-player ranking depth and strategic influence.',
          'Counting category wins would be arbitrary because one Major should not equal one percentage point of map rate, and “influence” has no natural unit. The better decision rule is lexicographic. First require an all-time peak: both qualify. Then require sustained championship dominance: both qualify. Then use repeated performance at the highest-stakes common event and duration at number one as tie-breakers. Astralis win both.',
          'That produces a narrow but clear answer. Astralis’ Magisk roster remains the greatest team in Counter-Strike history. Post-ropz Vitality are the best team at peak, the author of the greatest individual season, and already the closest challenger. This is not a lifetime award immune to new evidence. A third roster Major plus another sustained period at number one would move Vitality through the remaining Astralis advantages and should reopen—or end—the debate.',
        ],
        table: {
          caption: 'GOAT scorecard without arbitrary weights',
          headers: ['Question', 'Winner', 'Reason'],
          rows: [
            ['Highest measured peak?', 'Vitality', '7/8 LANs, 80.8% maps, 37-series long-form streak'],
            ['Best calendar year?', 'Vitality', 'Nine titles, two Majors, playoffs at all 16 events'],
            ['Best control of direct challengers?', 'Vitality', '14–0 in series during the peak comparison'],
            ['Best Major dynasty?', 'Astralis', 'Three consecutive Majors with the same five'],
            ['Longest uninterrupted reign?', 'Astralis', '58 weeks at HLTV #1'],
            ['Deepest five-player distribution?', 'Astralis', 'All five in the 2018 Top 20; four in the top 8'],
            ['Most strategically influential?', 'Astralis', 'Utility and protocol model reset elite expectations'],
            ['Greatest complete team?', 'Astralis', 'Peak threshold met; longevity and Major tie-breakers'],
          ],
          note: 'No composite score is reported because defensible weights are preference-dependent. The ordering rule is stated explicitly so readers can substitute their own definition.',
        },
        callout: 'Final answer: Astralis are still the GOAT. Vitality are the best peak—and one more championship phase away from making that distinction impossible to maintain.',
      },
    ],
    sources: [
      { label: 'HLTV — How Vitality compares to prime Astralis', url: 'https://www.hltv.org/news/42253/how-does-vitalitys-season-compare-to-prime-astralis', use: 'Eight-event conversion, map pools, streaks and records against closest challengers.' },
      { label: 'HLTV — Top teams of 2025', url: 'https://www.hltv.org/news/43615/the-top-10-teams-of-2025', use: 'Vitality’s nine-title season, 16 Big Events, two Majors and playoff floor.' },
      { label: 'HLTV — Vitality named Team of the Year', url: 'https://www.hltv.org/news/43607/vitality-named-team-of-the-year', use: 'Roster context, complete 2025 title list and year-end recognition.' },
      { label: 'HLTV — Vitality win a second Grand Slam', url: 'https://www.hltv.org/news/44422/vitality-make-history-as-first-team-to-win-two-grand-slams', use: 'Second Grand Slam and 2026 IEM Rio result.' },
      { label: 'HLTV — Vitality team overview', url: 'https://www.hltv.org/team/9565/vitality', use: '2026 event ledger, roster and current ranking context.' },
      { label: 'HLTV — Astralis top team of 2018', url: 'https://www.hltv.org/news/25740/top-10-teams-of-2018', use: 'Ten-title year, first Grand Slam and uninterrupted 2018 number-one position.' },
      { label: 'HLTV — Astralis top team of 2019', url: 'https://www.hltv.org/news/28738/top-10-teams-of-2019', use: 'Six-title follow-up season and two-Major year.' },
      { label: 'HLTV — Astralis make Major history', url: 'https://www.hltv.org/news/27804/astralis-make-major-history-with-berlin-triumph', use: 'Third consecutive Major with the Magisk roster.' },
      { label: 'HLTV — Astralis dynasty lineup statistics', url: 'https://www.hltv.org/stats/teams/lineups/6665/astralis', use: 'Complete lineup map record and LAN top-three count.' },
      { label: 'HLTV — Astralis: A legend in the making', url: 'https://www.hltv.org/news/24545/astralis-a-legend-in-the-making', use: 'Opening conversion, 4v5 recovery and utility-damage indicators.' },
      { label: 'HLTV — 2025 player ranking', url: 'https://www.hltv.org/players/top20/2025', use: 'Vitality player ranking distribution.' },
      { label: 'HLTV — Astralis’ 58-week reign', url: 'https://www.hltv.org/news/34411/csgo10-liquid-challenge-astralis-reign-2019', use: 'Number-one longevity and historical framing.' },
    ],
  },
  ...COUNTER_STRIKE_META_EDITORIALS,
];

export function findCounterStrikeEditorial(slug: string): CounterStrikeEditorial | undefined {
  return COUNTER_STRIKE_EDITORIALS.find((editorial) => editorial.slug === slug);
}
