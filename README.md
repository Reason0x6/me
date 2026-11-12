# Reason6

A minimal personal calling card with a cryptographic trail to [Reason0x6 on GitHub](https://github.com/Reason0x6). The hexadecimal footer begins an optional six-transmission puzzle trail. The GitHub link remains freely available.

## Develop

```sh
npm ci
npm start
```

## Verify and build

```sh
npm test
```

This builds the production site and runs the clue-chain tests. Use `npm run build` for a build alone.

Production output: `dist/g-austin/browser`. The established Angular build target is retained for existing hosting integrations.

## Archive

The previous Counter-Strike publication, The Server Room, and the SnapGrid project page are preserved in [`archive/server-room`](archive/server-room/ARCHIVE.md), including its source, assets, original documentation and build configuration. Archived files are not included in the production build.

## Puzzle maintenance (spoilers)

The calling card stays public. The optional trail uses physical static directories under `public/signal/`; direct visits and refreshes need no SPA fallback. Every chamber has a keyboard-accessible optional hint. Plate alignment has a text equivalent, the grid has a plain-text version, and the two-letterform cipher has an uppercase/lowercase transcription.

| Transmission | Mechanism | Destination / answer | Fragment |
| --- | --- | --- | --- |
| 01 | Decode homepage hex to `Reason0x6`; Base64-decode source payload, then XOR with the repeating UTF-8 name | `/signal/6f2a9c/` | TRACE |
| 02 | Align both SVG witnesses using the slider or downloaded plates | TRISTATE | UNDER |
| 03 | Five ternary digits per ASCII character; `·=0`, `\|=1`, `△=2` | `/signal/spiralxx/` | QUIET |
| 04 | Read the 4×4 grid clockwise in an inward spiral, starting top left and moving right | `/signal/fivebits` | STONE |
| 05 | Ignore carrier spaces; first letterform/lowercase=0, second/uppercase=1; five-bit groups, A=0 through Z=25 | THRESHOLD | WAITS |
| 06 | Collect fragments 01–05; fragment 06 is inside the original homepage SVG metadata | REASON | Final artifact |

The final key is SHA-256 of `TRACE UNDER QUIET STONE WAITS REASON` encoded as UTF-8. AES-256-GCM decrypts `public/signal/threshold/envelope.json`; ciphertext includes its appended 16-byte authentication tag. Browser decryption uses Web Crypto on HTTPS or localhost; the envelope and derivation instructions also support an offline solve. The final message and artifact are encrypted, and the artifact download is created only after successful decryption. To change a fragment, re-encrypt the envelope and update its artifact together.

Progress uses the local-storage key `reason6.transmissions`, an array of solved numbers. Arrival at a recovered destination records the preceding solve; only successful final decryption records 06. Storage is optional. Each mark on the homepage lights independently; pageshow/storage events refresh it on return. The earlier `reason6.signal.acknowledged=006` state migrates to transmission 01 only. Artifact numbers identify chapters, not visitors. This is an easter egg, not access control.

Run `node --test tests/puzzle.test.mjs` after building to solve the published clue chain, verify every destination and collectible, and test final decryption with correct and incorrect keys.
