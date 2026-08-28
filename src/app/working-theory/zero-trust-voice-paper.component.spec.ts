import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { ZeroTrustVoicePaperComponent } from './zero-trust-voice-paper.component';

describe('ZeroTrustVoicePaperComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZeroTrustVoicePaperComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the complete protocol and its limitations', () => {
    const fixture = TestBed.createComponent(ZeroTrustVoicePaperComponent);
    fixture.detectChanges();
    const paper = fixture.nativeElement as HTMLElement;

    expect(paper.querySelector('h1')?.textContent?.replace(/\s+/g, ' ')).toContain('Zero Trust Voice');
    expect(paper.textContent).toContain('Protocol state machine');
    expect(paper.textContent).toContain('Live relay is not solved by matching a code');
    expect(paper.textContent).toContain('Acceptance criteria');
    expect(paper.querySelectorAll('.voice-references li').length).toBe(14);
  });

  it('sets a descriptive document title', () => {
    const fixture = TestBed.createComponent(ZeroTrustVoicePaperComponent);
    fixture.detectChanges();

    expect(TestBed.inject(Title).getTitle()).toBe('Zero Trust Voice Verification — Working Theory');
  });
});
