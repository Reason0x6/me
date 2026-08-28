import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WorkingTheoryComponent } from './working-theory.component';

describe('WorkingTheoryComponent', () => {
  let fixture: ComponentFixture<WorkingTheoryComponent>;
  let component: WorkingTheoryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkingTheoryComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkingTheoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the publication and its opening index', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.textContent).toContain('Ideas should be allowed to remain unfinished.');
    expect(page.textContent).toContain('Observability is an editorial act');
    expect(page.querySelectorAll('.thought-row').length).toBe(8);
  });

  it('filters the index by format', () => {
    component.setKind('Question');
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.thought-row').length).toBe(1);
    expect(page.textContent).toContain('What deserves to become a platform?');
  });

  it('searches across titles, arguments, states, and themes', () => {
    component.setQuery('probabilistic');
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.thought-row').length).toBe(1);
    expect(page.textContent).toContain('AI systems need visible seams');
  });

  it('can clear combined filters', () => {
    component.setKind('Model');
    component.setTheme('Architecture');
    component.setQuery('configuration');
    component.clearFilters();

    expect(component.kindFilter()).toBe('All');
    expect(component.themeFilter()).toBe('All');
    expect(component.query()).toBe('');
    expect(component.filteredThoughts().length).toBe(8);
  });
});
