import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Thought, ThoughtKind, ThoughtState } from './thought';
import { THOUGHTS } from './thoughts.data';

type KindFilter = 'All' | ThoughtKind;

interface ThreadSummary {
  readonly name: string;
  readonly count: number;
  readonly description: string;
  readonly thoughtNumbers: readonly string[];
}

const THREAD_DESCRIPTIONS: Readonly<Record<string, string>> = {
  Systems: 'How interacting parts produce behavior no individual part intended.',
  Operations: 'The human work of keeping technical systems understandable and alive.',
  Legibility: 'What systems reveal, conceal, and make possible to reason about.',
  Architecture: 'Boundaries, defaults, and the consequences of structural choices.',
  Interfaces: 'Where technical decisions become human behavior.',
  Design: 'The deliberate removal of ambiguity, friction, and accidental choice.',
  AI: 'Probabilistic systems, visible uncertainty, and earned trust.',
  Organizations: 'The software hidden inside institutions and coordination.',
  Archives: 'What collections preserve, omit, and teach their keepers to notice.',
  Attention: 'Where focus goes, what interrupts it, and what earns its return.',
  Books: 'Reading, collecting, and living among ideas that remain unopened.',
  Chess: 'Judgment under constraint, visible consequences, and the dignity of a draw.',
  Communities: 'Small rooms, shared practices, and knowledge made between people.',
  Constraints: 'The productive pressure of limits, rules, and deliberately closed doors.',
  Culture: 'The language and assumptions hiding inside ordinary habits.',
  Hobbies: 'Things worth doing without converting them into output or advantage.',
  Judgment: 'Taste, uncertainty, evaluation, and the discipline of not deciding too soon.',
  Language: 'Words as infrastructure: what phrasing permits, prevents, and clarifies.',
  Making: 'Objects and unfinished projects as records of learning through the hands.',
  Media: 'How distinct forms become flattened into interchangeable material.',
  Memory: 'The traces objects, archives, and abandoned work leave behind.',
  Music: 'Listening as atmosphere, ritual, and a way of shaping attention.',
  Standards: 'Shared constraints that make important work easier to understand.',
  Taste: 'Preference as an instrument for navigating abundance.',
};

@Component({
  selector: 'app-working-theory',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './working-theory.component.html',
  styleUrl: './working-theory.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingTheoryComponent {
  private readonly document = inject(DOCUMENT);

  readonly thoughts = THOUGHTS;
  readonly featuredThought = THOUGHTS.find((thought) => thought.featured) ?? THOUGHTS[0];
  readonly query = signal('');
  readonly kindFilter = signal<KindFilter>('All');
  readonly themeFilter = signal('All');
  readonly kindOptions: readonly KindFilter[] = ['All', 'Note', 'Essay', 'Model', 'Question', 'Standard', 'White paper'];

  readonly themes = computed(() => [
    'All',
    ...new Set(this.thoughts.flatMap((thought) => thought.themes)),
  ]);

  readonly filteredThoughts = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return this.thoughts.filter((thought) => {
      const searchable = [
        thought.title,
        thought.dek,
        thought.thesis,
        thought.kind,
        thought.state,
        ...thought.themes,
        ...thought.body,
        ...(thought.references?.map((reference) => reference.label) ?? []),
      ]
        .join(' ')
        .toLocaleLowerCase();
      return (
        (!query || searchable.includes(query)) &&
        (this.kindFilter() === 'All' || thought.kind === this.kindFilter()) &&
        (this.themeFilter() === 'All' || thought.themes.includes(this.themeFilter()))
      );
    });
  });

  readonly threads = computed<readonly ThreadSummary[]>(() => {
    const counts = new Map<string, Thought[]>();
    for (const thought of this.thoughts) {
      for (const theme of thought.themes) {
        counts.set(theme, [...(counts.get(theme) ?? []), thought]);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([name, thoughts]) => ({
        name,
        count: thoughts.length,
        description: THREAD_DESCRIPTIONS[name] ?? `Notes connected by an interest in ${name.toLocaleLowerCase()}.`,
        thoughtNumbers: thoughts.map((thought) => thought.number),
      }));
  });

  setQuery(value: string): void {
    this.query.set(value);
  }

  setKind(kind: KindFilter): void {
    this.kindFilter.set(kind);
  }

  setTheme(theme: string): void {
    this.themeFilter.set(theme);
    this.scrollTo('index');
  }

  clearFilters(): void {
    this.query.set('');
    this.kindFilter.set('All');
    this.themeFilter.set('All');
  }

  scrollTo(id: string): void {
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  focusSearchInput(): void {
    this.scrollTo('index');
    (this.document.getElementById('thought-search') as HTMLInputElement | null)?.focus();
  }

  stateDescription(state: ThoughtState): string {
    switch (state) {
      case 'Spark':
        return 'An early idea with room to change.';
      case 'Working':
        return 'A live argument still being developed.';
      case 'Developed':
        return 'A formed position, open to revision.';
      case 'Revisited':
        return 'Returned to after further thought.';
    }
  }

  @HostListener('document:keydown', ['$event'])
  focusSearch(event: KeyboardEvent): void {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.matches('input, textarea, select, [contenteditable="true"]')) {
      return;
    }
    event.preventDefault();
    this.focusSearchInput();
  }
}
