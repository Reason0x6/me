import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { WorldRankPaperComponent } from './world-rank-paper.component';

describe('WorldRankPaperComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldRankPaperComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the formal theory and research programme', () => {
    const fixture = TestBed.createComponent(WorldRankPaperComponent);
    fixture.detectChanges();
    const paper = fixture.nativeElement as HTMLElement;

    expect(paper.querySelector('h1')?.textContent).toContain('How Many Facts');
    expect(paper.textContent).toContain('The Representation Theorem');
    expect(paper.textContent).toContain('Linear nullity theorem');
    expect(paper.textContent).toContain('The Law–Fact Frontier');
    expect(paper.querySelectorAll('.rank-references li').length).toBe(12);
  });

  it('sets a descriptive document title', () => {
    const fixture = TestBed.createComponent(WorldRankPaperComponent);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('How Many Facts Does Reality Actually Contain? — Working Theory');
  });
});
