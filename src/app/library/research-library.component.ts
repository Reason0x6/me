import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';

import { RESEARCH_PAPERS } from './research-papers.data';
import { ResearchPaper, RightsStatus } from './research-paper';

type RightsFilter = 'all' | RightsStatus;
type SortMode = 'curated' | 'newest' | 'oldest' | 'least-cited' | 'title';
type ViewMode = 'grid' | 'list';

interface RightsOption {
  readonly value: RightsFilter;
  readonly label: string;
  readonly shortLabel: string;
}

@Component({
  selector: 'app-research-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './research-library.component.html',
  styleUrl: './research-library.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResearchLibraryComponent {
  private readonly document = inject(DOCUMENT);
  readonly allPapers = RESEARCH_PAPERS;

  readonly query = signal('');
  readonly activeTopic = signal('All topics');
  readonly rightsFilter = signal<RightsFilter>('all');
  readonly sourceFilter = signal('All sources');
  readonly sortMode = signal<SortMode>('curated');
  readonly viewMode = signal<ViewMode>('grid');
  readonly showFilters = signal(false);
  readonly showBookmarksOnly = signal(false);
  readonly selectedPaper = signal<ResearchPaper | null>(null);
  readonly bookmarkedIds = signal<ReadonlySet<string>>(this.loadBookmarks());
  readonly copied = signal(false);

  readonly rightsOptions: readonly RightsOption[] = [
    { value: 'all', label: 'Any rights status', shortLabel: 'All' },
    { value: 'redistributable', label: 'Verified reusable', shortLabel: 'Reusable' },
    { value: 'link-only', label: 'Source link only', shortLabel: 'Link only' },
    { value: 'review', label: 'Awaiting review', shortLabel: 'Review' },
  ];

  readonly topicCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const paper of this.allPapers) {
      for (const topic of paper.topics) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  });

  readonly sourceTypes = computed(() => [
    'All sources',
    ...new Set(this.allPapers.map((paper) => paper.sourceType)),
  ]);

  readonly filteredPapers = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const topic = this.activeTopic();
    const rights = this.rightsFilter();
    const source = this.sourceFilter();
    const bookmarkedIds = this.bookmarkedIds();

    const matches = this.allPapers.filter((paper) => {
      const searchable = [
        paper.title,
        paper.organization,
        paper.summary,
        paper.authors.join(' '),
        paper.topics.join(' '),
        paper.sourceLabel,
        paper.license,
        paper.doi ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (topic === 'All topics' || paper.topics.includes(topic)) &&
        (rights === 'all' || paper.rightsStatus === rights) &&
        (source === 'All sources' || paper.sourceType === source) &&
        (!this.showBookmarksOnly() || bookmarkedIds.has(paper.id))
      );
    });

    return [...matches].sort((a, b) => {
      switch (this.sortMode()) {
        case 'newest':
          return b.year - a.year || a.title.localeCompare(b.title);
        case 'oldest':
          return a.year - b.year || a.title.localeCompare(b.title);
        case 'least-cited':
          return (a.citations ?? Number.MAX_SAFE_INTEGER) - (b.citations ?? Number.MAX_SAFE_INTEGER);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'curated':
        default:
          return Number(!!b.featured) - Number(!!a.featured) || b.addedAt.localeCompare(a.addedAt);
      }
    });
  });

  readonly activeFilterCount = computed(() =>
    Number(this.activeTopic() !== 'All topics') +
    Number(this.rightsFilter() !== 'all') +
    Number(this.sourceFilter() !== 'All sources') +
    Number(this.showBookmarksOnly()),
  );

  readonly redistributableCount = this.allPapers.filter((paper) => paper.rightsStatus === 'redistributable').length;
  readonly sourceFamilyCount = new Set(this.allPapers.map((paper) => paper.sourceLabel)).size;
  readonly topicCount = new Set(this.allPapers.flatMap((paper) => paper.topics)).size;

  updateQuery(value: string): void {
    this.query.set(value);
  }

  setTopic(topic: string): void {
    this.activeTopic.set(topic);
  }

  setRights(value: string): void {
    this.rightsFilter.set(value as RightsFilter);
  }

  setSource(value: string): void {
    this.sourceFilter.set(value);
  }

  setSort(value: string): void {
    this.sortMode.set(value as SortMode);
  }

  clearFilters(): void {
    this.query.set('');
    this.activeTopic.set('All topics');
    this.rightsFilter.set('all');
    this.sourceFilter.set('All sources');
    this.showBookmarksOnly.set(false);
  }

  toggleBookmarksOnly(): void {
    this.showBookmarksOnly.update((value) => !value);
  }

  isBookmarked(id: string): boolean {
    return this.bookmarkedIds().has(id);
  }

  toggleBookmark(id: string, event?: Event): void {
    event?.stopPropagation();
    const next = new Set(this.bookmarkedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.bookmarkedIds.set(next);

    try {
      window.localStorage.setItem('marginalia-bookmarks', JSON.stringify([...next]));
    } catch {
      // Bookmarks remain available for the current session when storage is unavailable.
    }
  }

  openPaper(paper: ResearchPaper): void {
    this.selectedPaper.set(paper);
  }

  closePaper(): void {
    this.selectedPaper.set(null);
    this.copied.set(false);
  }

  async copyCitation(paper: ResearchPaper): Promise<void> {
    const citation = `${paper.authors.join(', ')} (${paper.year}). ${paper.title}. ${paper.organization}. ${paper.sourceUrl}`;
    try {
      await navigator.clipboard.writeText(citation);
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1800);
    } catch {
      this.copied.set(false);
    }
  }

  scrollTo(id: string): void {
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  rightsLabel(status: RightsStatus): string {
    switch (status) {
      case 'redistributable':
        return 'Reusable';
      case 'link-only':
        return 'Link only';
      case 'review':
        return 'Rights review';
    }
  }

  citationLabel(count?: number): string {
    if (count === undefined) {
      return 'Citation data pending';
    }
    return `${new Intl.NumberFormat('en', { notation: count > 9999 ? 'compact' : 'standard' }).format(count)} citations`;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePaper();
  }

  private loadBookmarks(): ReadonlySet<string> {
    try {
      const saved = window.localStorage.getItem('marginalia-bookmarks');
      return new Set(saved ? (JSON.parse(saved) as string[]) : []);
    } catch {
      return new Set<string>();
    }
  }
}
