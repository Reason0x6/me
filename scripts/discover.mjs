import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_QUERIES = [
  'distributed systems infrastructure',
  'secure software development',
  'public digital infrastructure',
  'artificial intelligence governance',
  'climate adaptation cities',
  'public health systems',
  'accessibility inclusive design',
  'energy transition policy',
];

const REUSABLE_LICENSES = new Set([
  'cc-by',
  'cc-by-sa',
  'cc-by-nc',
  'cc-by-nc-sa',
  'cc-by-nd',
  'cc-by-nc-nd',
  'cc0',
  'public-domain',
]);

const queries = process.env.DISCOVERY_QUERIES?.split(',').map((value) => value.trim()).filter(Boolean) ?? DEFAULT_QUERIES;
const outputPath = resolve(process.env.DISCOVERY_OUTPUT ?? 'artifacts/review-queue.json');
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const contactEmail = process.env.OPENALEX_MAILTO ?? 'research-index@example.com';

const records = [];
const warnings = [];

for (const query of queries) {
  records.push(...await discoverOpenAlex(query));
}

if (githubToken) {
  for (const query of queries) {
    records.push(...await discoverGitHub(query));
  }
} else {
  warnings.push('GitHub discovery skipped because GITHUB_TOKEN or GH_TOKEN was not supplied.');
}

const deduplicated = deduplicate(records)
  .sort((a, b) => b.obscurityScore - a.obscurityScore || a.title.localeCompare(b.title));

const artifact = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: 'metadata-only',
  notice: 'Every candidate remains in review. No file was downloaded or approved for mirroring.',
  queries,
  warnings,
  count: deduplicated.length,
  records: deduplicated,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log(`Wrote ${deduplicated.length} review candidates to ${outputPath}`);
for (const warning of warnings) console.warn(warning);

async function discoverOpenAlex(query) {
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('filter', 'type:report,is_oa:true');
  url.searchParams.set('search', query);
  url.searchParams.set('sort', 'cited_by_count:asc');
  url.searchParams.set('per_page', '20');
  url.searchParams.set('mailto', contactEmail);
  url.searchParams.set('select', 'id,doi,title,publication_year,authorships,locations,primary_topic,cited_by_count,type');

  const response = await fetch(url, { headers: { 'User-Agent': `Marginalia discovery (${contactEmail})` } });
  if (!response.ok) throw new Error(`OpenAlex returned ${response.status} for “${query}”.`);
  const payload = await response.json();

  return payload.results.map((work) => {
    const locations = work.locations ?? [];
    const reusableLocation = locations.find((location) => REUSABLE_LICENSES.has(location.license));
    const bestLocation = reusableLocation ?? locations.find((location) => location.landing_page_url) ?? null;
    const licenseCandidate = reusableLocation?.license ?? bestLocation?.license ?? null;

    return {
      candidateId: work.doi ?? work.id,
      discoverySource: 'OpenAlex',
      discoveryQuery: query,
      title: work.title,
      authors: (work.authorships ?? []).map((entry) => entry.author?.display_name).filter(Boolean),
      year: work.publication_year,
      doi: work.doi,
      sourceUrl: bestLocation?.landing_page_url ?? work.doi ?? work.id,
      pdfCandidateUrl: bestLocation?.pdf_url ?? null,
      topic: work.primary_topic?.display_name ?? null,
      citations: work.cited_by_count ?? 0,
      licenseCandidate,
      licenseSourceUrl: reusableLocation?.landing_page_url ?? null,
      rightsStatus: 'review',
      rightsEvidence: licenseCandidate
        ? `Machine-detected ${licenseCandidate}; verify the exact asset and document notice.`
        : 'No reusable document-level license was detected.',
      obscurityScore: obscurityScore(work.cited_by_count ?? 0, work.publication_year),
    };
  });
}

async function discoverGitHub(query) {
  const url = new URL('https://api.github.com/search/code');
  url.searchParams.set('q', `${query} extension:pdf`);
  url.searchParams.set('sort', 'indexed');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', '10');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Marginalia discovery',
    },
  });
  if (!response.ok) {
    warnings.push(`GitHub returned ${response.status} for “${query}”; that query was skipped.`);
    return [];
  }

  const payload = await response.json();
  return payload.items.map((item) => ({
    candidateId: `github:${item.repository.full_name}:${item.path}`,
    discoverySource: 'GitHub',
    discoveryQuery: query,
    title: filenameToTitle(item.name),
    authors: [],
    year: null,
    doi: null,
    sourceUrl: item.html_url,
    repository: item.repository.full_name,
    repositoryUrl: item.repository.html_url,
    pdfCandidateUrl: null,
    topic: query,
    citations: null,
    licenseCandidate: null,
    licenseSourceUrl: null,
    rightsStatus: 'review',
    rightsEvidence: 'Public repository discovery only. Repository visibility and software licenses do not establish document reuse rights.',
    obscurityScore: 75,
  }));
}

function deduplicate(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item.doi ?? item.candidateId ?? item.sourceUrl).toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filenameToTitle(filename) {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function obscurityScore(citations, year) {
  const citationPenalty = Math.min(60, Math.log10(Math.max(1, citations + 1)) * 20);
  const recencyPenalty = year && year >= new Date().getUTCFullYear() - 1 ? 8 : 0;
  return Math.max(0, Math.round(100 - citationPenalty - recencyPenalty));
}

