import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-device-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-[1.2rem] border px-3 py-3"
      [ngClass]="inverse() ? 'border-white/10 bg-neutral-950 text-white' : 'border-black/10 bg-white/55 text-neutral-900'"
    >
      <p class="text-[0.62rem] font-semibold uppercase tracking-[0.28em]" [ngClass]="inverse() ? 'text-white/45' : 'text-black/45'">
        {{ label() }}
      </p>
      <div class="mt-2 flex items-end justify-between gap-3">
        <p class="text-sm font-medium leading-tight sm:text-base">{{ value() }}</p>
        <p *ngIf="meta()" class="text-[0.65rem] uppercase tracking-[0.22em]" [ngClass]="inverse() ? 'text-white/45' : 'text-black/45'">
          {{ meta() }}
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceDisplayComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly meta = input<string>('');
  readonly inverse = input(false);
}
