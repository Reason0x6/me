import { ChangeDetectionStrategy, Component, HostListener, computed, input, output, signal } from '@angular/core';

import { DeviceTransportState } from '../models/jazz-device.types';

@Component({
  selector: 'app-reel-control',
  standalone: true,
  template: `
    <div class="rounded-[2rem] border border-black/10 bg-white/45 p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-black/50">Reel</p>
          <p class="mt-1 text-sm font-medium text-black/65">{{ section() }}</p>
        </div>
        <p class="text-[0.65rem] uppercase tracking-[0.24em] text-black/45">{{ state() }}</p>
      </div>

      <div
        class="mx-auto mt-5 flex aspect-square w-full max-w-[19rem] cursor-pointer items-center justify-center rounded-full border border-black/10 bg-[radial-gradient(circle_at_30%_30%,#faf8f2_0%,#ddd7ca_55%,#c3bcae_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_36px_rgba(0,0,0,0.12)]"
        [style.background]="ringBackground()"
        (pointerdown)="startDrag($event)"
      >
        <div class="flex h-[70%] w-[70%] items-center justify-center rounded-full border border-black/10 bg-[radial-gradient(circle_at_30%_30%,#fffef9_0%,#e3ded1_55%,#c7bfb2_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div class="rounded-full border border-black/10 bg-neutral-950 px-5 py-3 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p class="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Elapsed</p>
            <p class="mt-2 text-2xl font-semibold tracking-[0.08em]">{{ elapsed() }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-[0.62rem] uppercase tracking-[0.22em] text-black/45">Active parts</p>
          <p class="mt-1 text-sm text-black/65">{{ activePartsLabel() }}</p>
        </div>
        <p class="text-sm font-medium text-black/70">{{ progressLabel() }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReelControlComponent {
  readonly progress = input(0);
  readonly elapsed = input('00:00');
  readonly section = input('Idle');
  readonly activeParts = input<readonly string[]>([]);
  readonly state = input<DeviceTransportState>('idle');
  readonly progressChange = output<number>();

  private readonly dragging = signal(false);
  private dragRect: DOMRect | null = null;

  readonly ringBackground = computed(() => {
    const progressAngle = Math.round(this.progress() * 360);
    return `conic-gradient(from -90deg, rgba(17,24,39,0.86) 0deg, rgba(17,24,39,0.86) ${progressAngle}deg, rgba(255,255,255,0.35) ${progressAngle}deg, rgba(255,255,255,0.35) 360deg)`;
  });

  readonly activePartsLabel = computed(() => this.activeParts().join(' · ') || 'Idle');
  readonly progressLabel = computed(() => `${Math.round(this.progress() * 100)}%`);

  startDrag(event: PointerEvent): void {
    this.dragRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragging.set(true);
    this.emitProgress(event);
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }

    this.emitProgress(event);
  }

  @HostListener('window:pointerup')
  stopDrag(): void {
    this.dragging.set(false);
    this.dragRect = null;
  }

  private emitProgress(event: PointerEvent): void {
    if (!this.dragRect) {
      return;
    }

    const centerX = this.dragRect.left + this.dragRect.width / 2;
    const centerY = this.dragRect.top + this.dragRect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const normalized = ((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
    this.progressChange.emit(normalized);
  }
}
