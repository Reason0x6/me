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

      <div class="mt-4 grid grid-cols-4 gap-2">
        <button
          type="button"
          class="transport-button transport-button-power"
          (click)="enabled() ? powerOff.emit() : initialize.emit()"
          [attr.aria-label]="enabled() ? 'Power off' : 'Power on'"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v8"></path>
            <path d="M7.05 5.05a9 9 0 1 0 9.9 0"></path>
          </svg>
        </button>
        <button type="button" class="transport-button transport-button-icon" (click)="play.emit()" [disabled]="!enabled()" aria-label="Play">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 6l10 6-10 6z"></path>
          </svg>
        </button>
        <button type="button" class="transport-button transport-button-icon" (click)="pause.emit()" [disabled]="!enabled()" aria-label="Pause">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 6h3v12H8z"></path>
            <path d="M13 6h3v12h-3z"></path>
          </svg>
        </button>
        <button type="button" class="transport-button transport-button-icon" (click)="stop.emit()" [disabled]="!enabled()" aria-label="Stop">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 8h8v8H8z"></path>
          </svg>
        </button>
      </div>

      <button
        type="button"
        class="transport-button mt-2 w-full"
        (click)="generate.emit()"
        [disabled]="!enabled()"
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

    .transport-button-icon,
    .transport-button-power {
      align-items: center;
      display: inline-flex;
      justify-content: center;
      padding: 0;
    }

    .transport-button svg {
      fill: none;
      height: 1rem;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
      width: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransportControlsComponent {
  readonly state = input.required<DeviceTransportState>();
  readonly enabled = input(false);

  readonly initialize = output<void>();
  readonly powerOff = output<void>();
  readonly play = output<void>();
  readonly pause = output<void>();
  readonly stop = output<void>();
  readonly generate = output<void>();
}
