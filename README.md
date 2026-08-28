# Working Theory

A personal publication for ideas in motion: notes, essays, models, and open questions about software, systems, institutions, and the connections between them.

This is intentionally not a portfolio. The home page is an evolving index, themes form cross-cutting threads, and every piece carries a maturity state so unfinished thoughts can be published honestly.

## Publish a thought

Thoughts live in [`src/app/working-theory/thoughts.data.ts`](src/app/working-theory/thoughts.data.ts). Add one object to `THOUGHTS` using the shape in [`thought.ts`](src/app/working-theory/thought.ts):

```ts
{
  number: '009',
  slug: 'a-stable-url-for-the-idea',
  title: 'The title',
  dek: 'A one-sentence introduction.',
  kind: 'Note',
  state: 'Spark',
  publishedAt: '2026-08-28',
  updatedAt: '2026-08-28',
  readingMinutes: 3,
  themes: ['Systems', 'Design'],
  thesis: 'The compact form of the argument.',
  body: ['Each item is rendered as a paragraph.'],
  related: ['another-thought-slug'],
}
```

The note is automatically searchable, appears in every matching thread, and gets a permalink at `/notes/<slug>`.

Available formats are `Note`, `Essay`, `Model`, `Question`, and `Standard`.

Maturity states communicate editorial intent:

- `Spark` — an early idea with room to change.
- `Working` — a live argument still being developed.
- `Developed` — a formed position, open to revision.
- `Revisited` — an idea returned to after further thought.

The included pieces are editable working drafts. Revise them as the real body of writing grows.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`.

```bash
npm run build
npm test -- --watch=false
```

The production build is written to `dist/g-austin/browser`.

## Structure

- `src/app/working-theory/` — publication components, data, and content types
- `src/working-theory.css` — shared editorial design system
- `src/app/features/` — earlier experiments retained in source but no longer routed
- `public/` — static assets
