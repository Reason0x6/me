import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { CounterStrikeEditorialComponent } from './counter-strike-editorial.component';

describe('CounterStrikeEditorialComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterStrikeEditorialComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ slug: 'how-spirit-finally-solved-vitality' }),
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('renders a data-led editorial with tables and evidence links', () => {
    const fixture = TestBed.createComponent(CounterStrikeEditorialComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain('How Spirit Finally Solved Vitality');
    expect(page.textContent).toContain('40–30');
    expect(page.textContent).toContain('70–43');
    expect(page.querySelectorAll('table').length).toBeGreaterThanOrEqual(2);
    expect(page.querySelectorAll('.cs-notes li').length).toBe(3);
  });

  it('sets a descriptive document title', () => {
    const fixture = TestBed.createComponent(CounterStrikeEditorialComponent);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('How Spirit Finally Solved Vitality — Working Theory');
  });
});
