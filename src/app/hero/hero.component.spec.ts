import { ViewportScroller } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let fixture: ComponentFixture<HeroComponent>;
  let viewportScroller: jasmine.SpyObj<ViewportScroller>;

  beforeEach(async () => {
    viewportScroller = jasmine.createSpyObj<ViewportScroller>('ViewportScroller', ['scrollToAnchor']);

    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [
        provideRouter([]),
        { provide: ViewportScroller, useValue: viewportScroller },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();
  });

  it('should create the landing page', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the main profile content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent ?? '';

    expect(text).toContain('GAVIN AUSTIN');
    expect(text).toContain('Three active channels');
    expect(text).toContain('Platform Engineering');
    expect(text).toContain('Late-night jazz generator');
    expect(text).toContain("Let's build something precise.");
  });

  it('should scroll when a control button is pressed', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = Array.from(compiled.querySelectorAll('button')).find((item) =>
      item.textContent?.includes('Projects')
    );

    expect(button).withContext('Expected Projects control button to exist').toBeTruthy();

    button?.dispatchEvent(new Event('click'));

    expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith('selected-work');
  });
});
