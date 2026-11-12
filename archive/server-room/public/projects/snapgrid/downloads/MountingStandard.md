# MT56x40-1 — enclosure mounting interface, revision 1

This is the shared interface defined for this project, not an industry certification. Every V8 case has the same underside pattern. DIN, SKÅDIS, OpenGrid and Gridfinity adapters bolt to it; the lid and internal carrier layout remain independent.

## Case-to-adapter standard

| Item | Definition |
|---|---|
| Datum | Centre of the case footprint; outside bottom plane is Z = 0 |
| X direction | Left to right across the connector panel |
| Y direction | Front connector edge toward the rear lid-loading edge |
| Z direction | From the underside toward the lid |
| Mount centres | X = ±28 mm, Y = ±20 mm: 56 × 40 mm rectangle |
| Case holes | Four Ø3.4 mm through holes |
| Case head seats | Ø6.8 mm, 90° countersinks opening inside the floor |
| Standard floor | 2.4 mm thick; nominal countersink depth 1.7 mm |
| Adapter contact | Flat face at Z = 0; features extend toward negative Z |
| Adapter plate | 4 mm thick, spanning Z = −4 to 0 |
| Captive nuts | Four M3 hex nuts, pockets 5.8 mm across flats × 2.5 mm deep, opening from the host side |
| Case fasteners | Four M3 × 6, 90° countersunk screws, introduced from inside the case |
| Nominal thread engagement | Approximately 2.1 mm within a 2.4 mm nut; tip remains within the 4 mm plate |

The rectangular pattern permits 180° reversal, not 90° interchange. Keep these pitches and datum fixed when making a new compatible adapter. Altering them creates a different interface even though the FreeCAD cells remain editable. The standard hole pattern should not scale with the enclosure.

Use matching flat-head hardware and measure its head dimensions. Fit the adapter before snapping the internal carriers into place: the mounting screws are accessed from inside. Hold the captive nuts while starting the screws; they are not intentionally interference-fit. V7 bases have no mounting holes: use a V8 base. V7 lids, shoes and front panels retain the same geometry.

## Adapter inventory

| Adapter folder under `Mounts` | Case compatibility | Host attachment |
|---|---|---|
| DIN | All three cases | Fixed upper lip and adjustable lower jaw for nominal TH35 × 7.5 rail |
| SKADIS | All three cases | Four quarter-turn bars, 80 × 40 mm centres |
| OpenGrid | All three cases | Two M3 screw snaps, 56 mm centres (two 28 mm cells) |
| Gridfinity_Compact3x2 | Compact case | 3 × 3 feet; 125.5 × 125.5 mm deck |
| Gridfinity_Grid4x4 | Square case | 4 × 4 feet; 167.5 × 167.5 mm deck |
| Gridfinity_Workshop4x3 | Workshop case | 4 × 3 feet; 167.5 × 125.5 mm deck |

Each adapter folder contains a native spreadsheet-driven `Adapter.FCStd`, STEP assembly, printable STLs and `Parts.json`. The case and adapter use the same coordinate system; importing both STEP files places them together. Hardware and host boards/rails are not included in the STEP exports.

Run `GenerateMounts.FCMacro` to rebuild the adapter defaults. Run `GenerateSnapGrid.FCMacro` to rebuild the cases. Both write into their existing output subfolders. Keep personal modified copies elsewhere. Changes to native FreeCAD models do not update STLs automatically.

## DIN rail

The reference is **35 mm wide, 7.5 mm deep, nominal 1 mm flange thickness**. These dimensions are supported by [Phoenix Contact's NS 35/7.5 drawing](https://www.phoenixcontact.com/en-de/products/din-rail-perforated-ns-35-75-perf-2000mm-0801733?type=pdf). The printed adapter is a mechanical prototype; it is not certified to EN 60715.

Print `Adapter.stl` and `DINSlidingJaw.stl`. Beyond the four common case screws/nuts, use **two M3 × 6 socket-head screws and two M3 hex nuts** for the lower jaw. Seat the jaw nuts in the plate from behind, introduce the jaw screws from its outer face, and leave the jaw free to slide along the slots. Attach the case to the adapter.

Hook the fixed upper jaw over the upper rail lip. Move the lower jaw outward, position the case, then slide the jaw inward until it captures the lower lip. Tighten the two jaw screws gently. The nominal model has 0.3 mm flange clearance; the adjustment slots let the jaw take this up. The upper/lower jaws resist pull-off. The clamp's actual friction and load capacity have not been tested; use rail end stops if longitudinal movement must be prevented.

Remove by supporting the case, loosening the lower jaw and sliding it clear. The rail runs along X in the native assembly. `DINWidth`, `DINFlange`, `DINGap` and `DINStandOff` are fit controls. `DINHeight` records the nominal host depth; it does not change the lip jaws. Other TH35 depths/flange gauges require a measured fit check. No compatibility claim is made for 15 mm or 32 mm wide rail profiles.

## SKÅDIS

The adapter targets **5 × 15 mm vertical obround slots** on the staggered **40 mm pattern**, using same-phase columns 80 mm apart and rows 40 mm apart. A compatible-accessory maker publishes those hole/pitch dimensions in its [SKÅDIS system reference](https://www.justhangingpegboards.com/pages/pegboard-system). Board thickness is nominally **5 mm** here and must be measured on your board; it is not treated as a manufacturer tolerance guarantee.

Print the plate and all four `SkadisToggle*.stl` bars. Tap their 2.6 mm pilots **M3 × 0.5**. Use **four M3 × 14 countersunk screws** as starting hardware for the nominal 5 mm board. This provides approximately 4.3 mm engagement in the 5 mm printed bars; recalculate for a different board thickness. The four common case screws/nuts are separate.

Before fitting the case, loosely attach the bars to the plate. Align each bar's long axis vertically and pass it through its slot. Rotate each bar 90° behind the board, so its 12.6 mm length crosses the slot horizontally, then tighten gently. The 4.2 mm insertion width fits inside the nominal 5 mm slot. The spacing pads establish a 0.5 mm front gap. Confirm that all four bars turned and sit across solid board, rather than spinning in the slots. Then bolt the case onto the plate from inside.

This is a screw-clamped mounting method, not a gravity hook: no extra anti-lift clip is required by its geometry. Printed threads and board compression still limit strength. Access to the rear of the board is helpful for the first installation. To remove, support the case, expose the plate screws by removing the case, loosen and rotate the bars vertical. Do not overtighten the printed threads or crush the board.

## OpenGrid

The plate uses two **M3** attachment holes at **56 mm** centres. Supply **two published OpenGrid Metric Screw Snaps** appropriate to the board. The [OpenGrid snap guide](https://www.opengrid.world/guides/snaps/) distinguishes Full boards (6.8 mm) and Lite boards (4 mm) and links the metric screw snaps. Obtain the original parts from [David D's metric screw snap model](https://www.printables.com/model/1217921-opengrid-metric-screw-snaps), also linked by the project documentation.

**Those board snaps are an external dependency and are not reproduced in this kit.** The printed part supplied here is the case-to-snap adapter. Use the creator's M3 version and its hardware/print instructions. Choose the appropriate normal/directional Full or Lite variant for your board and load direction; a plain board-mounting screw snap is not automatically an accessory snap.

Fasten the two metric snaps to the adapter with countersunk M3 screws, keeping the heads flush with the case-contact face. Required screw length is **4 mm plate thickness plus the snap's permitted engagement**; verify this against the selected snap's nut/thread depth and rear clearance. Do not assume one screw length works for both Full and Lite. Fit the case using the four common fasteners, then insert the snaps per the creator's instructions. Access to the board back can assist removal.

The rendered OpenGrid lattice is a nominal visual reference; its lock geometry is not an exported printable board or a snap-fit verification. This design uses OpenGrid's 28 mm spacing, not Multiboard's 25 mm spacing.

## Gridfinity

The bases use **42 mm cell pitch**, **0.5 mm total perimeter clearance**, and the community foot profile: **0.8 mm lower chamfer + 1.8 mm straight band + 2.15 mm upper chamfer**, total **4.75 mm**. Widths progress **35.6 → 37.2 → 41.5 mm**; corner radii remain concentric, **0.8 → 1.6 → 3.75 mm**. This follows the published [Gridfinity profile reference](https://gridfinity-docs.securedev.codes/reference/specification.html), cross-linked there to community dimensional drawings and Gridfinity Rebuilt.

The case is an accessory mounted on a Gridfinity footed deck. It is **not** a stackable bin with a standard top lip, and its total height is not constrained to 7 mm units. The adapter adds 8.75 mm beneath the case (4 mm plate plus 4.75 mm feet). The compact case takes a 3×3 footprint because its 85.6 mm depth exceeds two 42 mm cells; this avoids collision with adjacent allocated bins.

Four optional corner pockets are **Ø6.5 × 2.4 mm**, located at the standard ±13 mm offsets within the outer corner cells. They accept nominal **6 × 2 mm magnets**, with fit allowance. Check polarity against the receiving baseplate and retain the magnets appropriately. Magnets are optional; no magnetic holding-force claim is made. The case screws/nuts attach the deck mechanically. Four access wells through the feet allow insertion of the common captive nuts.

Print the `Mounts/FitCoupons/GridfinityFoot.stl` and `GridfinitySocket.stl` samples first. The socket is a generated reference sample, not an official baseplate product. The nominal profile fit was checked against a separately constructed socket. Magnet holes exist only at the four whole-deck outer corners, not every cell. Gridfinity is used horizontally here; it is not a wall/overhead retention mechanism.

Changing `GFCols`/`GFRows` in a saved document changes the perimeter expressions but does not create additional feet. Change the corresponding `build('Gridfinity', cols, rows)` call in the generator and rebuild when changing the foot count. Do not scale the 42 mm pitch or mating profile to resize the enclosure.

## Print and verification notes

Adapter plates are exported with their flat case-contact faces on the bed. Inspect nut-pocket bridges and the DIN jaw in your slicer, using local support if needed. SKÅDIS bars print on their broad face; tap and test one before printing the full set. Use the same material/fit discipline described in the main README. Hardware is not included in the STL exports.

The package checks native single-solid validity, closed meshes, plate/case separation, seated part collisions, nominal DIN lip capture, quarter-turn bar insertion and retention in nominal SKÅDIS holes, and Gridfinity section sizes/socket clearance. OpenGrid checks the screw pitch and case plate only; the external snaps remain responsible for board retention. No physical fit, load, vibration or long-term creep testing has been done. Start with a small fit sample and a supported installation before putting equipment on a wall.

The upload pack contains direct CAD assembly and underside renders. Hosts are nominal reference geometry. OpenGrid is exploded and its external screw snaps are not shown. Hardware is omitted.
