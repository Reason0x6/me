import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { COUNTER_STRIKE_EDITORIALS } from './counter-strike-editorials.data';

@Component({
  selector: 'app-counter-strike-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './counter-strike-hub.component.html',
  styleUrl: './counter-strike-hub.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterStrikeHubComponent {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  readonly editorials = [...COUNTER_STRIKE_EDITORIALS].reverse();
  readonly featured = this.editorials[0];
  readonly archive = this.editorials.slice(1);
  readonly totalMinutes = this.editorials.reduce((total, editorial) => total + editorial.readingMinutes, 0);

  constructor() {
    this.title.setTitle('The Server Room — Counter-Strike Analysis');
    this.document.defaultView?.scrollTo({ top: 0 });
  }
}
