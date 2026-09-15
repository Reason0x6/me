# V8 — slide-and-clip lid / direct snap grid

The snap-grid design replaces the elevated dovetail deck with short floor supports and flexible clips that latch into carrier windows. The lid slides in from the rear, locks into a side pocket, and releases by pressing its rear-right pad inward. No lid screws or inserts are required.

V8 adds a common underside mounting pattern and adapters for DIN rail, SKÅDIS, OpenGrid and Gridfinity. See [MountingStandard.md](MountingStandard.md) for dimensions, hardware, installation and compatibility limits. The V7 lid and internal shoes remain compatible; use a V8 base for the four mounting holes. V5/V6 dovetail carts do not fit the snap grid.

See the CAD image gallery in the parent upload pack.

## Included configurations

| Folder | Outside dimensions, X × Y × Z | Carrier allocation |
|---|---|---|
| Compact3x2 | 121.6 × 85.6 × 28.4 mm | C6 1×2, WAGO 413 1×1, WAGO 415 1×1, universal 2×1 |
| Grid4x4 | 157.6 × 157.6 × 28.4 mm | Exactly one universal 2×2 plus twelve blank 1×1 carriers |
| Workshop4x3 | 157.6 × 121.6 × 32.4 mm | C6 1×2, WAGO 412/413/415 1×1 each, universal 2×2, cable saddle 1×1, two blank 1×1 |

Each configuration contains `Enclosure.FCStd`, `Enclosure.step`, oriented printable STLs, `Parts.json`, the part manifest. `Lid.stl` has that configuration's vents; `LidClosed.stl` is the closed alternative. Print one lid. The compact lid has two long slots, matching the original photo; the other lids use the paired curved vent layout.

The carrier top is now **5.6 mm above the inner floor**, versus 15.45 mm for V6: 9.85 mm less mounting height, about 64% lower. The compact case is about 31% shorter in height than V6. Required board/component and cable clearances still determine the final case height.

## Define a case by its layout

The grid pitch is **36 mm**. A 1×1 shoe is 32 × 32 mm, a 1×2 shoe 32 × 68 mm, and a 2×2 shoe 68 × 68 mm. The 4 mm space between neighbouring shoes provides clip/release access. The grid is an allocation scheme, not deep internal partitions.

Edit `Layouts.json`, then run `GenerateSnapGrid.FCMacro` in FreeCAD to rebuild the case and its matching carriers. Keep the macro next to the JSON file. The generator writes into each configuration's named subfolder, replacing those generated files; save personal edits elsewhere first.

Example module entry:

```json
{"id": "Large2x2", "kind": "universal", "x": 0, "y": 0, "nx": 2, "ny": 2}
```

- `cols`, `rows`: grid size in cells.
- `x`, `y`: zero-based starting cell. X runs left to right; Y runs front to rear.
- `nx`, `ny`: cells occupied in each direction. They must fit without overlapping another module.
- `kind`: `blank`, `universal`, `c6`, `wago412`, `wago413`, `wago415`, or `cable`.
- `id`: a unique simple name for that carrier.
- `height`: cavity height above the inner floor, in mm.
- `vents`: `paired`, `curved`, or `none`. `ports: false` produces a blank panel except for any C6 access.

C6 requires at least 1×2 cells and must start on the front row (`y: 0`) for direct USB access. The supplied layouts use one C6. Large modules replace the cells they occupy: a 4×4 layout with one 2×2 leaves twelve cells. Overlapping and out-of-bounds footprints are rejected.

**Clips are placed for the selected module footprints.** This keeps their number down: two for a one-row footprint, four for a footprint spanning multiple rows. A 2×2 region does not retain unused clips in its middle. Changing the footprint arrangement therefore requires regenerating and printing its matching base; it is not a universal floor on which every footprint can be swapped without changes. Same-size carriers with the same pitch/interface remain interchangeable.

## Adjust dimensions in FreeCAD

Open `Enclosure.FCStd`, double-click **Parameters**, edit column C and recompute. These files use native Part primitives and Boolean features driven by spreadsheet expressions; they recompute without a custom Python feature or an installed plugin.

| Parameter | Default | Meaning |
|---|---:|---|
| CellPitch | 36 mm | Grid and footprint spacing |
| Margin | 4 mm | Grid perimeter to cavity |
| InnerHeight | 24 / 28 mm | Floor-to-lid cavity height |
| SnapSeat | 3.6 mm | Support height below shoe |
| ShoeThickness | 2 mm | Carrier plate thickness |
| ClipGap | 0.45 mm | Running clearance between beam and shoe window |
| ClipHook | 0.75 mm | Hook projection; seated overlap is Hook minus Gap |
| ClipThickness | 1 mm | Flexible floor clip thickness |
| ClipTopGap | 0.25 mm | Clearance above seated shoe |
| LidGap | 0.35 mm | Sliding clearance |
| LidDetent | 0.55 mm | Lateral lid bump projection |
| LidReleaseLength | 24 mm | Flexible rear-right lid arm length |
| VentEnabled | 1 | 0 closes vents; 1 enables the chosen pattern |
| VentWidth | 2.4 mm | Vent slot width |

Preserve the `InnerLength` and `InnerWidth` formulas. Footprint topology is generated from JSON; spreadsheet edits do not add/remove modules. Use JSON and regenerate when changing allocation or module type. Do not reduce CellPitch below 36 mm for the supplied hardware carriers. Parameter values are not automatically clamped: inspect the result after changes. Tested alternate dimensions are 38 mm pitch, 30 mm cavity height and 0.55 mm clip gap.

## Snap interface and removal

Each shoe lowers over four small locating pins and rests on the support pads. Its window edges push the clips outward along the lead-in ramps; the hooks return over the plate. The default overlap is 0.30 mm. Locating pins resist lateral motion, while the hooks resist lift.

To remove a shoe, open the lid, push its exposed clip tips **outward from the shoe centre** using a small blunt tool, and lift that edge gently. For four-clip carriers, release one end and hold it slightly raised, then release the other end. Do not lever against the PCB or pull the shoe straight up against engaged hooks. The base clips are integral; a broken floor clip requires repairing/reprinting the base.

`FitCoupons/ClipBase.stl` and `Shoe_0p35.stl`, `Shoe_0p45.stl`, `Shoe_0p55.stl` reproduce the production interface. Print the base and one shoe first, beginning at 0.45 mm. Larger gap means less engagement and easier insertion; 0.55 mm retains 0.20 mm overlap. Keep ClipGap below ClipHook. Coupons are derived print samples; the full enclosure is the parametric source.

## Sliding lid

Install the front insert vertically into its guide, then introduce the lid tongues from the rear. Slide the lid toward the front panel until the side detent seats in its pocket. To open, press the exposed rear-right pad inward toward the centre while sliding the lid rearward. Avoid pulling upward: the side tongues retain it vertically. Leave approximately one case depth clear behind it for complete removal.

The latch spring and its pocket are on the straight side-wall section, ahead of the rounded rear corner. The motion checks distinguish the intended detent interference from the clear sliding path with the detent retracted. They do not simulate elastic bending, fatigue, print anisotropy or operating force.

`FitCoupons/LidChannelCoupon.stl` and `LidLatchCoupon.stl` isolate the right-rear slide and latch. Print both, introduce the tongue from the open rear end and test pressing the spring inward to release it. This small sample checks the sliding clearance and latch before printing an entire lid and base.

## Electronics and panel

The C6 holder uses the DFR1075 board outline **60 × 25.4 mm** and mounting pitch **56.6 × 22 mm**, from [DFRobot's mechanical drawing](https://dfimg.dfrobot.com/wiki/20576/DFR1075_firebeetle-esp32-c6-microcontroller_dimension_v1.pdf). The long board direction is front-to-rear. Four 1.6 mm trial pilots take small M2 screws; verify the actual board holes and screw engagement. The green PCB and silver socket in the native document are nominal reference envelopes, excluded from print/STEP exports.

The front opening is a **14 × 8 mm rounded cable-access slot**, not a circular socket and not a separate USB bulkhead. This larger opening lets the cable overmould reach the onboard USB socket, which is recessed behind the panel in the grid layout. Nominal socket centre is 3.2 mm above the PCB underside and nominal projection beyond the PCB is 1.2 mm; these remain unverified hardware offsets. Measure your board and test your actual USB cable before a full print. The opening follows the C6's X position and support stack.

The Ethernet example uses a 16.6 × 14.6 mm opening and 3.8 mm mounting bores spaced 25 mm apart, based on the earlier [Adafruit 909 example](https://www.adafruit.com/product/909). The grommet bore is 12 mm in a 2.4 mm panel. Actual connector bodies, flange depth, cable bend radii and wiring are not represented or collision-checked. They may require moving/removing a front-row carrier or increasing case height. The Grid4x4 allocation demonstrator has Ethernet/grommet openings but no C6 USB opening.

WAGO holders cover **221-412 / 413 / 415**. They now use shallow front/rear lips and a small cable tie for retention, keeping the release windows accessible. Check lever travel and wire entry on your actual connectors. Other WAGO 221 families have different dimensions. Generic carriers provide trial M3 pilots plus tie slots; choose hardware length to avoid the case floor.

## Printing and assembly

Start with unfilled PETG for the prototype clips, a 0.4 mm nozzle, 0.2 mm layers and enough perimeters to make the thin clips solid. Prusa describes PETG's toughness and good layer adhesion in its [material guide](https://help.prusa3d.com/article/petg_2059). These are starting choices, not tested settings for this design. The 1 mm floor clips are built vertically and their roots are sensitive to layer bonding; print and cycle the coupon before committing to a base. General snap-fit behaviour and prototyping considerations are covered in [Formlabs' snap-fit guide](https://formlabs.com/eu/blog/designing-3d-printed-snap-fit-enclosures/); it does not validate this FDM design.

STLs are oriented with base and carriers bottom-down, the lid's outside face down, and the panel flat on its broad face. Inspect the slicer for the small clip ledges and sliding grooves; add only local support if your printer needs it, keeping mating surfaces clean. Deburr/string-clean before fitting. Do not scale an entire STL to adjust clearance; change the parameter and re-export.

Print coupons, choose the fit, then print the matching base/shoes and lid. Fit electronics and cable ties to loose shoes, snap them into the base, fit the front insert, route wires below the lid path, then slide and latch the lid. Check full connector insertion before closing.

## Renders and validation

The upload pack contains direct CAD renders of the mounting options. Host references are nominal and external hardware is omitted. No generated product images are included.

Validation includes reopened native models, valid single solids, closed exported meshes, seated assembly collision checks, nominal C6 reference clearance, clear lid travel with the detent excluded, positive latch/vertical lid retention, positive shoe lift retention, and changed pitch/height/clip gap plus closed lids. See the JSON validation reports. No physical print fit, clip-life, load, thermal or electrical tests have been performed. This is a prototype enclosure system, without an established sealing or mains-insulation rating.
