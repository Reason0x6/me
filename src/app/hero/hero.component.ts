import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ProjectCard {
  readonly title: string;
  readonly tag: string;
  readonly description: string;
}

interface TimelineItem {
  readonly label: string;
  readonly value: string;
}

interface QuickStat {
  readonly value: string;
  readonly label: string;
}

interface ControlItem {
  readonly label: string;
  readonly symbol: string;
  readonly fragment: string;
}

interface ProfileFact {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  private readonly viewportScroller = inject(ViewportScroller);

  readonly projects: readonly ProjectCard[] = [
    {
      title: 'Platform Engineering',
      tag: 'Systems',
      description:
        'Building reliable applications, cloud workflows, APIs, and maintainable architecture across web, mobile, and backend systems.',
    },
    {
      title: 'Cloud Delivery',
      tag: 'DevOps',
      description:
        'Designing Azure-first delivery pipelines, observability, and Infrastructure as Code to keep releases consistent, secure, and scalable.',
    },
    {
      title: 'Applied Automation',
      tag: 'AI',
      description:
        'Using scripting, event-driven systems, and AI-assisted workflows to reduce manual effort and improve operational clarity across complex environments.',
    },
  ];

  readonly timeline: readonly TimelineItem[] = [
    { label: 'Role', value: 'Software Engineer' },
    { label: 'Current', value: 'WSP Digital' },
    { label: 'Focus', value: 'React \u00b7 Angular \u00b7 Django \u00b7 .NET \u00b7 Azure' },
    { label: 'Style', value: 'DevOps, IaC, AI integration, security-first delivery' },
  ];

  readonly quickStats: readonly QuickStat[] = [
    { value: '05', label: 'Years' },
    { value: '04', label: 'Core languages' },
    { value: '03', label: 'CI/CD stacks' },
    { value: '02', label: 'Cloud platforms' },
    { value: '02', label: 'IaC toolchains' },
    { value: '1500+', label: 'Companies served' },
  ];

  readonly profileFacts: readonly ProfileFact[] = [
    { label: 'Experience', value: '5 years across delivery, architecture, APIs, web, mobile, and cloud systems.' },
    { label: 'Education', value: 'Bachelor of Software Engineering (Hons.), University of Newcastle, 2023.' },
    { label: 'History', value: 'WSP Digital, May 2025 to present. BiscIT, July 2022 to May 2025.' },
  ];

  readonly specialties: readonly string[] = [
    'Azure',
    '.NET',
    'Angular',
    'React',
    'PowerShell',
    'Python',
    'Django',
    'Flask',
    'FastAPI',
    'DevOps',
    'Bicep',
    'Docker',
  ];

  readonly controls: readonly ControlItem[] = [
    { label: 'Work', symbol: '\u25cf', fragment: 'field-profile' },
    { label: 'Projects', symbol: '\u25b6', fragment: 'selected-work' },
    { label: 'Contact', symbol: '\u25a0', fragment: 'contact-panel' },
  ];

  // Placeholder destinations kept together for easy replacement later.
  readonly contactLinks = {
    email: 'mailto:hello@example.com',
    github: 'https://github.com',
    linkedIn: 'https://www.linkedin.com',
  } as const;

  scrollTo(fragment: string): void {
    this.viewportScroller.scrollToAnchor(fragment);
  }
}
