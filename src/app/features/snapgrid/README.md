# SnapGrid project page

Route: `/projects/snapgrid`. The home page links to it under Selected work.

The standalone component is lazy loaded. Its project data and mounting selection live in `snapgrid.component.ts`; long-form how-tos live in the HTML template. The diagram is a labelled orientation schematic, not a dimensioned drawing.

## Assets and releases

Public files are under `public/projects/snapgrid/`. The images are WebP versions of the actual V8 CAD renders. Downloads include the complete source ZIP, individual case ZIPs, mounts, clip/lid samples and reference documents. No external OpenGrid snap files or invented print profile are bundled.

For a future release, replace the download archives and images together, update the V8 labels and configuration dimensions, and preserve the documented distinction between the internal 36 mm grid and external mounting standards. Check each ZIP with a ZIP integrity tool before shipping. The current files are CAD-checked prototypes and have not been physically print-tested.

## Local verification

Run `npm start -- --port 4317`, then open `/projects/snapgrid`. Check all four mounting buttons, the underside toggle, disclosure guides, homepage return link and downloads. Test at narrow and desktop widths. Run `npm run build` for production compilation.

The page adds no dependencies and does not publish or deploy the site.
