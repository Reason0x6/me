# Discovery and ingestion

Marginalia should discover broadly but publish conservatively. The intended
pipeline has four stages.

## 1. Discover metadata

Initial adapters should cover OpenAlex, Crossref, CORE, Zenodo, arXiv,
institutional repositories, government catalogues, and GitHub searches for PDF,
Markdown, and release assets in public repositories.

GitHub repository visibility or a repository-level software license must never
be treated as proof that an included paper can be redistributed. The document
itself needs applicable license evidence.

## 2. Normalize and deduplicate

Normalize DOI values, canonical URLs, author names, dates, and license
identifiers. Prefer DOI as the stable key, followed by repository identifiers.
Use a SHA-256 digest for downloaded review copies to identify exact duplicates.
Near-duplicate title matching should create review suggestions, not silently
merge records.

## 3. Review rights

New discoveries begin in `review`. A reviewer records the license URL, the
relevant notice from the document, the rights holder, and the date checked.
The record can then move to `redistributable`, `link-only`, or remain in
`review`.

## 4. Publish

Publish normalized metadata as immutable versioned JSON. Only reviewed reusable
assets should enter object storage. Keep the source URL beside every mirror,
retain the original filename and digest, and support prompt correction or
takedown requests.

## Suggested automation boundary

A scheduled workflow may fetch metadata, score likely-obscure works, and open a
review batch. It must not automatically mirror a document based only on an
`is_open_access` flag, a reachable PDF URL, or a repository license classifier.

The first metadata-only worker is implemented in `scripts/discover.mjs`. Run it
with `npm run discover`; it writes `artifacts/review-queue.json`. GitHub scanning
is enabled when `GITHUB_TOKEN` or `GH_TOKEN` is present. The scheduled workflow
uploads the queue as a private workflow artifact and never commits candidates or
downloads PDFs automatically.

Useful obscurity signals include low citation count, limited index coverage,
older publication date, uncommon source, and absence from the current
catalogue. These are ranking hints—not measures of quality.
