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

  it('publishes all twelve editorials in a dedicated analysis index', () => {
    const fixture = TestBed.createComponent(CounterStrikeHubComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const editorialLinks = page.querySelectorAll('a[href^="/editorials/"]');

    expect(page.querySelector('h1')?.textContent).toContain('The server');
    expect(page.querySelector('h1')?.textContent).toContain('room.');
    expect(page.textContent).toContain('Astralis Are Still the Greatest Counter-Strike Team of All Time');
    expect(page.textContent).toContain('VRS Is Not a Leaderboard');
    expect(page.textContent).toContain('Spirit Lead the Rest-of-2026 S-Tier Forecast');
    expect(page.textContent).toContain('Super Falcons Against Every Era-Defining Five');
    expect(page.textContent).toContain('Falcons’ Final Form');
    expect(page.textContent).toContain('ropz Plays Better on Weekends');
    expect(editorialLinks.length).toBe(12);
  });

  it('sets a descriptive document title', () => {
    const fixture = TestBed.createComponent(CounterStrikeHubComponent);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('The Server Room — Counter-Strike Analysis');
  });
});
