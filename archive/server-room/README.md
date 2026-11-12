# The Server Room

An independent, Counter-Strike-only publication for long-form analysis of professional teams, tactics, rankings, form and history.

The homepage is the complete article index. Every piece declares its sample, data cut-off and evidence sources; the current editorial format supports statistical summaries, tables, comparison bars and explicit falsification tests.

## Publish an analysis

Articles implement the `CounterStrikeEditorial` interface in [`src/app/working-theory/counter-strike-editorials.data.ts`](src/app/working-theory/counter-strike-editorials.data.ts). Content is split into focused files and combined into `COUNTER_STRIKE_EDITORIALS`:

- `counter-strike-editorials.data.ts` — current teams, tournaments and historical comparisons
- `counter-strike-meta-editorials.data.ts` — tactical legacy pieces
- `counter-strike-systems-editorials.data.ts` — current-system analysis, including VRS

Each article needs a unique slug and number, four hero statistics, at least five sections, and a linked evidence ledger. It is published automatically at `/editorials/<slug>` and appears on the homepage in reverse publication order.

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

- `src/app/working-theory/counter-strike-hub.*` — homepage and article index
- `src/app/working-theory/counter-strike-editorial.*` — reusable long-form article renderer
- `src/app/working-theory/*editorials.data.ts` — published content and sources
- `src/counter-strike-hub.css` — homepage design system
- `src/counter-strike-editorial.css` — article and print design system
- `public/` — static assets

Legacy `/counter-strike` and `/counter-strike/editorials/<slug>` URLs redirect to the current routes.
