# Reason6

A minimal personal calling card with a cryptographic trail to [Reason0x6 on GitHub](https://github.com/Reason0x6). The hexadecimal footer begins an optional three-step puzzle. The GitHub link remains freely available.

## Develop

```sh
npm ci
npm start
```

## Verify and build

```sh
npm run build
```

Production output: `dist/g-austin/browser`. The established Angular build target is retained for existing hosting integrations.

## Archive

The previous Counter-Strike publication, The Server Room, and the SnapGrid project page are preserved in [`archive/server-room`](archive/server-room/ARCHIVE.md), including its source, assets, original documentation and build configuration. Archived files are not included in the production build.

## Puzzle maintenance (spoilers)

1. The homepage hex decodes to `Reason0x6` (UTF-8, case-sensitive).
2. Activating the sigil reveals “You have the name. Follow the source.” The comment in `src/index.html` provides a Base64 payload and repeating-key XOR instructions.
3. Base64-decode the payload, then XOR each byte with `key[index % key.length]`, using the decoded name as the key. The plaintext is `/signal/6f2a9c/`.

The destination is a physical static directory in `public/`, so direct visits and refreshes work without an SPA fallback. It offers downloadable artifact 006, then records `reason6.signal.acknowledged=006` in local storage. On returning home, all six sigil marks illuminate. Storage is optional; blocked storage does not prevent solving or downloading. This is an easter egg, not an access-control mechanism. Artifact 006 is its identifier, not a visitor counter.

Run `node --test tests/puzzle.test.mjs` to verify the entire clue chain and the built static files after building.
