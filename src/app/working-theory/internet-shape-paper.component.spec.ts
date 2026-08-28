import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { InternetShapePaperComponent } from './internet-shape-paper.component';

describe('InternetShapePaperComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternetShapePaperComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the complete research design', () => {
    const fixture = TestBed.createComponent(InternetShapePaperComponent);
    fixture.detectChanges();
    const paper = fixture.nativeElement as HTMLElement;

    expect(paper.querySelector('h1')?.textContent).toContain('What Shape Is');
    expect(paper.textContent).toContain('Measurement design');
    expect(paper.textContent).toContain('How shape changes with dimension');
    expect(paper.textContent).toContain('Validation and falsification');
    expect(paper.querySelectorAll('.shape-references li').length).toBe(14);
  });

  it('sets a descriptive document title', () => {
    const fixture = TestBed.createComponent(InternetShapePaperComponent);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('What Shape Is the Internet? — Working Theory');
  });
});
