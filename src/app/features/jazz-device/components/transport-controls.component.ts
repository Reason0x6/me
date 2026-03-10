import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DeviceTransportState } from '../models/jazz-device.types';

@Component({
  selector: 'app-transport-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-[1.5rem] border border-black/10 bg-white/50 p-4">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-black/50">Transport</p>
        <span class="rounded-full border border-black/10 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-black/55">
          {{ state() }}
        </span>
      </div>

      <div class="mt-4 grid grid-cols-5 gap-2">
        <button type="button" class="transport-button col-span-2" (click)="initialize.emit()">
          {{ enabled() ? 'Power on' : 'Power' }}
        </button>
        <button type="button" class="transport-button" (click)="play.emit()" [disabled]="!enabled()">Play</button>
        <button type="button" class="transport-button" (click)="pause.emit()" [disabled]="!enabled()">Pause</button>
        <button type="button" class="transport-button" (click)="stop.emit()" [disabled]="!enabled()">Stop</button>
      </div>

      <button
        type="button"
        class="transport-button mt-2 w-full"
        (click)="generate.emit()"
      >
        Generate new take
      </button>
    </div>
  `,
  styles: [`
    .transport-button {
      border: 1px solid rgb(0 0 0 / 0.1);
      border-radius: 1rem;
      background: rgb(229 224 214 / 0.9);
      min-height: 2.75rem;
      padding: 0.55rem 0.8rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      transition: transform 140ms ease, background-color 140ms ease;
    }

    .transport-button:hover:enabled,
    .transport-button:focus-visible:enabled {
      background: rgb(221 216 206);
      transform: translateY(-1px);
    }

    .transport-button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransportControlsComponent {
  readonly state = input.required<DeviceTransportState>();
  readonly enabled = input(false);

  readonly initialize = output<void>();
  readonly play = output<void>();
  readonly pause = output<void>();
  readonly stop = output<void>();
  readonly generate = output<void>();
}
