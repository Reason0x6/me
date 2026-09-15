import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-lid-fit-guide',
  standalone: true,
  template: `
    <div class="guide">
      <div class="legend"><span><i class="channel"></i> CHANNEL TEST</span><span><i class="lid"></i> LID TEST</span><span>ACTUAL CAD PARTS</span></div>
      <div class="steps" role="group" aria-label="Lid test assembly steps">
        @for (step of steps; track step.title; let i = $index) {
          <button type="button" [class.active]="selected === i" [attr.aria-pressed]="selected === i" (click)="selected = i"><span>0{{ i + 1 }}</span>{{ step.title }}</button>
        }
      </div>
      <figure>
        <img [src]="'/projects/snapgrid/images/lid-step-' + (selected + 1) + '.webp'" width="1200" height="820" [alt]="steps[selected].alt">
        <figcaption aria-live="polite"><div><span class="index">0{{ selected + 1 }} / 03</span><h4>{{ steps[selected].heading }}</h4><p>{{ steps[selected].text }}</p></div><button class="next" type="button" (click)="selected = (selected + 1) % 3">{{ selected === 2 ? 'Start again ↺' : 'Next step →' }}</button></figcaption>
      </figure>
      <p class="note">Views show the assembly orientation. Colour identifies each part; no deformation is simulated.</p>
    </div>
  `,
  styleUrl: './lid-fit-guide.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LidFitGuideComponent {
  selected = 0;
  readonly steps = [
    { title: 'Orient', heading: 'Smooth face up. Tongue down.', text: 'Flip the lime lid piece over from its printing orientation. Keep the blue-grey channel upright, with the groove facing the lid. The pieces are separated here so you can see their mating edges.', alt: 'Separated actual CAD lid coupons: upright blue-grey channel with exposed groove and lime lid with its smooth face upward.' },
    { title: 'Slide', heading: 'Enter from the open end.', text: 'Keep the tongue level with the groove and slide in the white-arrow direction. The release tab stays at the trailing, rear end. Do not push the lid down into the channel from above.', alt: 'Lime lid entering the open rear end of the blue-grey channel. A white arrow points lengthways along the groove toward the front.' },
    { title: 'Release', heading: 'Press inward. Slide back.', text: 'Once seated, the small bump engages the channel pocket. Press the rear release tab toward the lid centre, in the white-arrow direction, and slide the lid back out while holding it released.', alt: 'Seated lid and channel coupons with a white arrow at the rear release tab pointing away from the channel toward the lid centre.' },
  ];
}
