import { TestBed } from '@angular/core/testing';

import { ResearchLibraryComponent } from './research-library.component';

describe('ResearchLibraryComponent', () => {
  beforeEach(async () => {
    window.localStorage.removeItem('marginalia-bookmarks');
    await TestBed.configureTestingModule({ imports: [ResearchLibraryComponent] }).compileComponents();
  });

  it('renders the archive and its seed records', () => {
    const fixture = TestBed.createComponent(ResearchLibraryComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Important work rarely arrives with a press release.');
    expect(text).toContain('Zero Trust Architecture');
    expect(fixture.componentInstance.filteredPapers().length).toBeGreaterThan(0);
  });

  it('searches across titles, summaries, people, and topics', () => {
    const fixture = TestBed.createComponent(ResearchLibraryComponent);
    const component = fixture.componentInstance;
    component.updateQuery('consensus');
    expect(component.filteredPapers().map((paper) => paper.id)).toEqual(['raft-consensus']);
  });

  it('keeps rights filtering explicit', () => {
    const fixture = TestBed.createComponent(ResearchLibraryComponent);
    const component = fixture.componentInstance;
    component.setRights('redistributable');
    expect(component.filteredPapers().every((paper) => paper.rightsStatus === 'redistributable')).toBeTrue();
  });

  it('persists saved record identifiers', () => {
    const fixture = TestBed.createComponent(ResearchLibraryComponent);
    const component = fixture.componentInstance;
    component.toggleBookmark('nist-zero-trust-architecture');
    expect(component.isBookmarked('nist-zero-trust-architecture')).toBeTrue();
    expect(window.localStorage.getItem('marginalia-bookmarks')).toContain('nist-zero-trust-architecture');
  });
});
