import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LidFitGuideComponent } from './lid-fit-guide.component';

@Component({
  selector: 'app-snapgrid',
  standalone: true,
  imports: [RouterLink, LidFitGuideComponent],
  templateUrl: './snapgrid.component.html',
  styleUrl: './snapgrid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapgridComponent {
  readonly asset = '/projects/snapgrid/';
  readonly layouts: Record<string, { cols: number; rows: number; modules: { id: string; kind: string; x: number; y: number; nx: number; ny: number }[] }> = {
  "Compact3x2": {
    "cols": 3,
    "rows": 2,
    "modules": [
      {
        "id": "FireBeetle",
        "kind": "c6",
        "x": 0,
        "y": 0,
        "nx": 1,
        "ny": 2
      },
      {
        "id": "Wago413",
        "kind": "wago413",
        "x": 1,
        "y": 0,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Wago415",
        "kind": "wago415",
        "x": 2,
        "y": 0,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Universal",
        "kind": "universal",
        "x": 1,
        "y": 1,
        "nx": 2,
        "ny": 1
      }
    ]
  },
  "Grid4x4": {
    "cols": 4,
    "rows": 4,
    "modules": [
      {
        "id": "Large2x2",
        "kind": "universal",
        "x": 0,
        "y": 0,
        "nx": 2,
        "ny": 2
      },
      {
        "id": "Cell_2_0",
        "kind": "blank",
        "x": 2,
        "y": 0,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_3_0",
        "kind": "blank",
        "x": 3,
        "y": 0,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_2_1",
        "kind": "blank",
        "x": 2,
        "y": 1,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_3_1",
        "kind": "blank",
        "x": 3,
        "y": 1,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_0_2",
        "kind": "blank",
        "x": 0,
        "y": 2,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_1_2",
        "kind": "blank",
        "x": 1,
        "y": 2,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_2_2",
        "kind": "blank",
        "x": 2,
        "y": 2,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_3_2",
        "kind": "blank",
        "x": 3,
        "y": 2,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_0_3",
        "kind": "blank",
        "x": 0,
        "y": 3,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_1_3",
        "kind": "blank",
        "x": 1,
        "y": 3,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_2_3",
        "kind": "blank",
        "x": 2,
        "y": 3,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Cell_3_3",
        "kind": "blank",
        "x": 3,
        "y": 3,
        "nx": 1,
        "ny": 1
      }
    ]
  },
  "Workshop4x3": {
    "cols": 4,
    "rows": 3,
    "modules": [
      {
        "id": "FireBeetle",
        "kind": "c6",
        "x": 0,
        "y": 0,
        "nx": 1,
        "ny": 2
      },
      {
        "id": "Wago412",
        "kind": "wago412",
        "x": 1,
        "y": 0,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Wago413",
        "kind": "wago413",
        "x": 2,
        "y": 0,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Wago415",
        "kind": "wago415",
        "x": 3,
        "y": 0,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "Large2x2",
        "kind": "universal",
        "x": 1,
        "y": 1,
        "nx": 2,
        "ny": 2
      },
      {
        "id": "Cable",
        "kind": "cable",
        "x": 0,
        "y": 2,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "BlankA",
        "kind": "blank",
        "x": 3,
        "y": 1,
        "nx": 1,
        "ny": 1
      },
      {
        "id": "BlankB",
        "kind": "blank",
        "x": 3,
        "y": 2,
        "nx": 1,
        "ny": 1
      }
    ]
  }
};
  selectedMount = 0;
  underside = false;
  readonly cases = [
    { name: 'Compact 3×2', file: 'Compact3x2', size: '121.6 × 85.6 × 28.4 mm', description: 'FireBeetle C6, WAGO 413 + 415 and a universal carrier. Two long lid vents.', cells: '06' },
    { name: 'Grid 4×4', file: 'Grid4x4', size: '157.6 × 157.6 × 28.4 mm', description: 'One 2×2 universal carrier and twelve 1×1 blanks. Grouped curved lid vents.', cells: '16' },
    { name: 'Workshop 4×3', file: 'Workshop4x3', size: '157.6 × 121.6 × 32.4 mm', description: 'C6, three WAGO holders, a 2×2 universal, cable saddle and two blanks. Curved vents.', cells: '12' },
  ];
  readonly mounts = [
    { name: 'DIN rail', image: '01_DIN', title: 'A fixed lip. An adjustable jaw.', text: 'For nominal TH35 × 7.5 mm rail. Hook the upper lip onto the rail, move the lower jaw into engagement and tighten its two screws. Support the case when releasing the jaw.', hardware: 'Extra: 2 × M3×6 socket-head screws + 2 × M3 nuts.', note: 'Nominal 0.3 mm flange clearance. Clamp friction is untested; use rail end stops where needed.' },
    { name: 'SKÅDIS', image: '02_SKADIS', title: 'Four bars, one quarter turn.', text: 'Insert the four bars vertically through the board slots, turn them 90° behind the board, then tighten gently. Mount the adapter to the board before fastening the case.', hardware: 'Extra: 4 × M3×14 countersunk screws for a nominal 5 mm board. Tap bar pilots M3×0.5.', note: 'Targets 5 × 15 mm slots with attachment centres 80 × 40 mm apart. Measure board thickness and confirm each bar is fully turned.' },
    { name: 'OpenGrid', image: '03_OpenGrid', title: 'An adapter for the snap ecosystem.', text: 'Two M3 attachment holes sit 56 mm apart on the 28 mm OpenGrid system. Attach the appropriate published M3 screw snaps to the plate, then install according to their creator’s guide.', hardware: 'Extra: 2 external M3 screw snaps + countersunk screws sized for the selected snap.', note: 'Snaps are not included or modelled. The assembly image is exploded; the lattice is a nominal reference, not verified locking geometry.' },
    { name: 'Gridfinity', image: '04_Gridfinity_Compact3x2', title: 'A place on the workbench.', text: 'Bolt the footed deck to the case and seat it in a horizontal Gridfinity baseplate. Compact uses 3×3 feet, Grid uses 4×4, and Workshop uses 4×3.', hardware: 'Optional: 4 × 6×2 mm magnets in the outer corner pockets.', note: '42 mm pitch; the adapter adds 8.75 mm below the case. This is a dock, not a stackable bin or wall-retention mount.' },
  ];
  get mount() { return this.mounts[this.selectedMount]; }
  readonly example = `{
  "id": "Large2x2", "kind": "universal",
  "x": 0, "y": 0, "nx": 2, "ny": 2
}`;
}
