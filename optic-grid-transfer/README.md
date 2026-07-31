# OpticGrid Transfer

A browser-only proof of concept for sending a file from a desktop display to a phone camera using a custom monochrome visual protocol.

## Features

- No server-side file upload
- Custom 72×72 visual frame
- Approx. 500 payload bytes per frame
- Frame looping
- Per-frame CRC validation
- Whole-file SHA-256 verification
- Mobile camera receiver
- File download after reconstruction

## Run

Camera access generally requires HTTPS or localhost.

### Local desktop test

```bash
npm start
```

Open:

- `http://localhost:4200/optic-grid-transfer/index.html`
- `http://localhost:4200/optic-grid-transfer/sender.html`
- `http://localhost:4200/optic-grid-transfer/receiver.html`

For a real phone, deploy the folder to any HTTPS static host, such as GitHub Pages, Cloudflare Pages, Netlify, or Vercel.

## Usage

1. Open `sender.html` on the computer.
2. Select a file and start transmitting.
3. Put the sender in full screen.
4. Open `receiver.html` on the phone.
5. Start the rear camera.
6. Align the complete visual square inside the on-screen guide.
7. Hold steady until the hash-verified download button appears.

## Current limitations

- The receiver uses a centre crop rather than automatic perspective correction.
- The phone should be almost square-on to the display.
- The protocol repeats sequential frames rather than fountain-coded symbols.
- No adaptive thresholding yet.
- Large files will transfer slowly.
- iOS may require the user to keep the page foregrounded.

## Recommended next improvements

- Detect the four finder markers and perform a homography.
- Add adaptive thresholding per cell.
- Add Reed–Solomon or fountain coding.
- Use WebAssembly/SIMD for image processing.
- Negotiate grid size and frame rate automatically.
- Add colour symbols after monochrome operation is reliable.
