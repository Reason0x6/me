import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { CounterStrikeHubComponent } from './counter-strike-hub.component';

describe('CounterStrikeHubComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterStrikeHubComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('publishes the four editorials in a dedicated analysis index', () => {
    const fixture = TestBed.createComponent(CounterStrikeHubComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const editorialLinks = page.querySelectorAll('a[href^="/counter-strike/editorials/"]');

    expect(page.querySelector('h1')?.textContent).toContain('The server');
    expect(page.querySelector('h1')?.textContent).toContain('room.');
    expect(page.textContent).toContain('Vitality, Astralis, and the Greatest Team of All Time');
    expect(editorialLinks.length).toBe(4);
  });

  it('sets a descriptive document title', () => {
    const fixture = TestBed.createComponent(CounterStrikeHubComponent);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('Counter-Strike Analysis — Working Theory');
  });
});
