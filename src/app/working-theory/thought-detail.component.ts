import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { THOUGHTS } from './thoughts.data';
import { Thought } from './thought';

function isThought(thought: Thought | undefined): thought is Thought {
  return thought !== undefined;
}

@Component({
  selector: 'app-thought-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './thought-detail.component.html',
  styleUrl: './thought-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThoughtDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  readonly copied = signal(false);
  readonly thought = computed(() => THOUGHTS.find((entry) => entry.slug === this.params().get('slug')) ?? null);
  readonly relatedThoughts = computed(() => {
    const thought = this.thought();
    return thought ? thought.related.map((slug) => THOUGHTS.find((entry) => entry.slug === slug)).filter(isThought) : [];
  });

  constructor() {
    effect(() => {
      const thought = this.thought();
      this.title.setTitle(thought ? `${thought.title} — Working Theory` : 'Not found — Working Theory');
      this.document.defaultView?.scrollTo({ top: 0 });
    });
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.document.location.href);
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1600);
    } catch {
      this.copied.set(false);
    }
  }
}
