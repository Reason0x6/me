import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

interface VoiceReference {
  readonly id: number;
  readonly authority: string;
  readonly title: string;
  readonly date: string;
  readonly url: string;
}

@Component({
  selector: 'app-zero-trust-voice-paper',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './zero-trust-voice-paper.component.html',
  styleUrl: './zero-trust-voice-paper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZeroTrustVoicePaperComponent {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  readonly copied = signal(false);
  readonly references: readonly VoiceReference[] = [
    { id: 1, authority: 'National Anti-Scam Centre', title: 'Targeting scams: report on scams data and activity 2025', date: '30 March 2026', url: 'https://www.scamwatch.gov.au/research-and-resources/targeting-scams-report' },
    { id: 2, authority: 'Australian Communications and Media Authority', title: 'SMS Sender ID Register goes live to help protect Australians from scams', date: '1 July 2026', url: 'https://www.acma.gov.au/articles/2026-06/sms-sender-id-register-goes-live-help-protect-australians-scams' },
    { id: 3, authority: 'Australian Communications and Media Authority', title: 'Getting text messages from businesses and organisations', date: '2026', url: 'https://www.acma.gov.au/getting-text-messages-businesses-and-organisations' },
    { id: 4, authority: 'Federal Register of Legislation', title: 'Scams Prevention Framework Act 2025', date: '20 February 2025', url: 'https://www.legislation.gov.au/C2025A00015/latest/text' },
    { id: 5, authority: 'Services Australia', title: 'Who we are', date: '3 June 2026', url: 'https://www.servicesaustralia.gov.au/who-we-are?context=22' },
    { id: 6, authority: 'Services Australia', title: 'Scam? Stop, think and check: is this for real?', date: '2025', url: 'https://www.servicesaustralia.gov.au/sites/default/files/2025-01/scams-awareness-brochure.pdf' },
    { id: 7, authority: 'myGov', title: 'Using the myGov app', date: '1 July 2026', url: 'https://my.gov.au/en/about/help/mygov-app/using-the-mygov-app' },
    { id: 8, authority: 'myID', title: 'How to set up myID and choose an identity strength', date: '14 November 2025', url: 'https://www.myid.gov.au/how-to-set-up-myid?path=increase-your-identity-strength' },
    { id: 9, authority: 'myID', title: 'Using myID with myGov', date: '25 September 2025', url: 'https://www.myid.gov.au/using-myid-with-mygov' },
    { id: 10, authority: 'Australian Taxation Office', title: 'Verify Call workflow — practitioner working group outcomes', date: '28 April 2026', url: 'https://softwaredevelopers.ato.gov.au/sites/default/files/2026-05/PLS_%20working_group_Key_Outcomes_28_April_2026.pdf' },
    { id: 11, authority: 'National Institute of Standards and Technology', title: 'SP 800-207: Zero Trust Architecture', date: 'August 2020', url: 'https://doi.org/10.6028/NIST.SP.800-207' },
    { id: 12, authority: 'World Wide Web Consortium', title: 'Web Authentication: An API for accessing public key credentials — Level 3', date: 'May 2026', url: 'https://www.w3.org/TR/webauthn-3/' },
    { id: 13, authority: 'Internet Engineering Task Force', title: 'RFC 7519: JSON Web Token (JWT)', date: 'May 2015', url: 'https://www.rfc-editor.org/rfc/rfc7519' },
    { id: 14, authority: 'Internet Engineering Task Force', title: 'RFC 9052: CBOR Object Signing and Encryption (COSE)', date: 'August 2022', url: 'https://www.rfc-editor.org/rfc/rfc9052' },
  ];

  constructor() {
    this.title.setTitle('Zero Trust Voice Verification — Working Theory');
    afterNextRender(() => {
      this.document.defaultView?.setTimeout(() => {
        const sectionId = decodeURIComponent(this.document.location.hash.slice(1));
        if (sectionId) {
          this.document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
        } else {
          this.document.defaultView?.scrollTo({ top: 0 });
        }
      });
    });
  }

  printPaper(): void {
    this.document.defaultView?.print();
  }

  async copyLink(): Promise<void> {
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(this.document.location.href);
      this.copied.set(true);
      this.document.defaultView?.setTimeout(() => this.copied.set(false), 1600);
    } catch {
      this.copied.set(false);
    }
  }
}
