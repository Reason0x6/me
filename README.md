# Marginalia

Marginalia is a metadata-first index of overlooked white papers, field reports,
technical notes, and institutional research. It is designed around a strict
distinction between material that is publicly reachable and material that may
legally be redistributed.

## What is implemented

- Responsive Angular catalogue with full-text client-side search
- Topic, source, and rights-status filters
- Curated, date, title, and citation-count sorting
- Persistent local bookmarks
- Detailed record drawer with provenance and rights evidence
- Seed catalogue of real research sources
- Collection-method and rights-policy explanations in the public UI

No third-party paper is currently copied into this repository. Every seed entry
links to its original source. A `redistributable` status means a record appears
eligible for mirroring; the actual file should still pass the review checklist
before it is downloaded or published.

## Development

```bash
npm ci
npm start
```

Open `http://localhost:4200/`.

```bash
npm test -- --watch=false
npm run build
```

The production build is written to `dist/g-austin/` for the existing Cloudflare
configuration.

## Catalogue structure

The initial catalogue lives in
`src/app/library/research-papers.data.ts` and implements the record contract in
`src/app/library/research-paper.ts`. Each record contains:

- Bibliographic metadata and canonical source URL
- Source type, topics, and discovery date
- Document format and optional DOI/citation signals
- One of `redistributable`, `link-only`, or `review`
- Human-readable evidence supporting that rights status

See [docs/INGESTION.md](docs/INGESTION.md) for the planned discovery pipeline and
[docs/RIGHTS-POLICY.md](docs/RIGHTS-POLICY.md) for the publication gate.
