import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-device-dial',
  standalone: true,
  template: `
    <label class="block rounded-[1.4rem] border border-black/10 bg-white/55 p-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-black/50">{{ label() }}</p>
        <p class="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/60">{{ displayValue() }}</p>
      </div>

      <div class="mt-3 flex items-center gap-3">
        <div class="relative h-14 w-14 rounded-full border border-black/10 bg-[radial-gradient(circle_at_30%_30%,#fefdf8_0%,#dad6cc_60%,#bfb9ae_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_16px_rgba(0,0,0,0.08)]">
          <span
            class="absolute left-1/2 top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/5 rounded-full bg-neutral-900"
            [style.transform]="indicatorTransform()"
          ></span>
        </div>

        <input
          class="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-neutral-900"
          type="range"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="value()"
          (input)="onInput($event)"
        />
      </div>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceDialComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly displayValue = input.required<string>();
  readonly min = input(0);
  readonly max = input(1);
  readonly step = input(0.01);
  readonly valueChange = output<number>();

  readonly indicatorTransform = computed(() => {
    const span = this.max() - this.min();
    const normalized = span === 0 ? 0 : (this.value() - this.min()) / span;
    const angle = -130 + normalized * 260;
    return `translate(-50%, -100%) rotate(${angle}deg)`;
  });

  onInput(event: Event): void {
    const nextValue = Number((event.target as HTMLInputElement).value);
    this.valueChange.emit(nextValue);
  }
}
