import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { COUNTER_STRIKE_EDITORIALS, findCounterStrikeEditorial } from './counter-strike-editorials.data';

@Component({
  selector: 'app-counter-strike-editorial',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './counter-strike-editorial.component.html',
  styleUrl: './counter-strike-editorial.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterStrikeEditorialComponent {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly copied = signal(false);
  readonly editorial = findCounterStrikeEditorial(this.route.snapshot.paramMap.get('slug') ?? '');
  readonly otherEditorials = COUNTER_STRIKE_EDITORIALS.filter((item) => item.slug !== this.editorial?.slug);

  constructor() {
    if (!this.editorial) {
      void this.router.navigateByUrl('/');
      return;
    }

    this.title.setTitle(`${this.editorial.title} — Working Theory`);
    afterNextRender(() => {
      const sectionId = decodeURIComponent(this.document.location.hash.slice(1));
      if (sectionId) {
        this.document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
      } else {
        this.document.defaultView?.scrollTo({ top: 0 });
      }
    });
  }

  printEditorial(): void {
    this.document.defaultView?.print();
  }

  async copyLink(): Promise<void> {
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(this.document.location.href);
      this.copied.set(true);
      this.document.defaultView?.setTimeout(() => this.copied.set(false), 1600);
    } catch {
      this.copied.set(false);
    }
  }
}
