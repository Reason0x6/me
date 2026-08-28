import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

interface RankReference {
  readonly id: number;
  readonly authors: string;
  readonly title: string;
  readonly publication: string;
  readonly year: string;
  readonly url: string;
}

@Component({
  selector: 'app-world-rank-paper',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './world-rank-paper.component.html',
  styleUrl: './world-rank-paper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldRankPaperComponent {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  readonly copied = signal(false);
  readonly references: readonly RankReference[] = [
    { id: 1, authors: 'S. A. Goldman and M. J. Kearns', title: 'On the Complexity of Teaching', publication: 'Journal of Computer and System Sciences 50(1)', year: '1995', url: 'https://doi.org/10.1006/jcss.1995.1003' },
    { id: 2, authors: 'N. Pena et al.', title: 'Data Dependencies for Query Optimization: a Survey', publication: 'The VLDB Journal 30', year: '2021', url: 'https://link.springer.com/article/10.1007/s00778-021-00676-3' },
    { id: 3, authors: 'N. Vereshchagin and P. Vitányi', title: 'Kolmogorov’s Structure Functions and Model Selection', publication: 'IEEE Transactions on Information Theory 50(12)', year: '2004', url: 'https://arxiv.org/abs/cs/0204037' },
    { id: 4, authors: 'P. Gács, J. Tromp, and P. Vitányi', title: 'Algorithmic Statistics', publication: 'IEEE Transactions on Information Theory 47(6)', year: '2001', url: 'https://arxiv.org/abs/math/0006233' },
    { id: 5, authors: 'C. Rommens, P. Traversa, G. F. de Arruda, and Y. Moreno', title: 'The Informational Cost of Structure: Representational Complexity in Networked Dynamical Systems', publication: 'arXiv:2607.03608', year: '2026', url: 'https://arxiv.org/abs/2607.03608' },
    { id: 6, authors: 'S. M. Emadi', title: 'The Causal Description Gap: Information-Theoretic Separations Across Pearl’s Hierarchy', publication: 'arXiv:2605.02177', year: '2026', url: 'https://arxiv.org/abs/2605.02177' },
    { id: 7, authors: 'R. Hermann and A. J. Krener', title: 'Nonlinear Controllability and Observability', publication: 'IEEE Transactions on Automatic Control 22(5)', year: '1977', url: 'https://doi.org/10.1109/TAC.1977.1101601' },
    { id: 8, authors: 'J. P. Crutchfield and K. Young', title: 'Inferring Statistical Complexity', publication: 'Physical Review Letters 63', year: '1989', url: 'https://doi.org/10.1103/PhysRevLett.63.105' },
    { id: 9, authors: 'M. B. Kennel and M. Buhl', title: 'Estimating Good Discrete Partitions from Observed Data: Symbolic False Nearest Neighbors', publication: 'Physical Review Letters 91', year: '2003', url: 'https://doi.org/10.1103/PhysRevLett.91.084102' },
    { id: 10, authors: 'M. Buhl and M. B. Kennel', title: 'Estimating a Generating Partition from Observed Time Series: Symbolic Shadowing', publication: 'Physical Review E 70', year: '2004', url: 'https://doi.org/10.1103/PhysRevE.70.016215' },
    { id: 11, authors: 'R. M. Karp', title: 'Reducibility Among Combinatorial Problems', publication: 'Complexity of Computer Computations', year: '1972', url: 'https://doi.org/10.1007/978-1-4684-2001-2_9' },
    { id: 12, authors: 'I. Shpitser and J. Pearl', title: 'Complete Identification Methods for the Causal Hierarchy', publication: 'Journal of Machine Learning Research 9', year: '2008', url: 'https://www.jmlr.org/papers/v9/shpitser08a.html' },
  ];

  constructor() {
    this.title.setTitle('How Many Facts Does Reality Actually Contain? — Working Theory');
    afterNextRender(() => {
      this.document.defaultView?.setTimeout(() => this.scrollToRequestedSection());
    });
  }

  private scrollToRequestedSection(): void {
    const sectionId = decodeURIComponent(this.document.location.hash.slice(1));
    if (sectionId) {
      this.document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
      return;
    }
    this.document.defaultView?.scrollTo({ top: 0 });
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
