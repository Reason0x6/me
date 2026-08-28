import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

interface PaperReference {
  readonly id: number;
  readonly authors: string;
  readonly title: string;
  readonly publication: string;
  readonly year: string;
  readonly url: string;
}

@Component({
  selector: 'app-internet-shape-paper',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './internet-shape-paper.component.html',
  styleUrl: './internet-shape-paper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternetShapePaperComponent {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  readonly copied = signal(false);
  readonly references: readonly PaperReference[] = [
    { id: 1, authors: 'RIPE NCC', title: 'RIPE Atlas documentation: probes and user-defined measurements', publication: 'RIPE Atlas', year: '2026', url: 'https://atlas.ripe.net/docs/' },
    { id: 2, authors: 'CAIDA', title: 'Archipelago Measurement Infrastructure', publication: 'Center for Applied Internet Data Analysis', year: '2026', url: 'https://www.caida.org/projects/ark/' },
    { id: 3, authors: 'CAIDA', title: 'The IPv4 Routed /24 Topology Dataset', publication: 'Center for Applied Internet Data Analysis', year: '2026', url: 'https://www.caida.org/catalog/datasets/ipv4_routed_24_topology_dataset/' },
    { id: 4, authors: 'N. Spring, R. Mahajan, and D. Wetherall', title: 'Measuring ISP Topologies with Rocketfuel', publication: 'ACM SIGCOMM', year: '2002', url: 'https://conferences.sigcomm.org/sigcomm/2002/papers/rocketfuel.html' },
    { id: 5, authors: 'T. S. E. Ng and H. Zhang', title: 'Predicting Internet Network Distance with Coordinates-Based Approaches', publication: 'IEEE INFOCOM', year: '2002', url: 'https://www.cs.utexas.edu/~lam/395t/papers/GNP2002.pdf' },
    { id: 6, authors: 'F. Dabek, R. Cox, M. F. Kaashoek, and R. Morris', title: 'Vivaldi: A Decentralized Network Coordinate System', publication: 'ACM SIGCOMM', year: '2004', url: 'https://research.google/pubs/vivaldi-a-decentralized-network-coordinate-system/' },
    { id: 7, authors: 'J. Ledlie, P. Gardner, and M. Seltzer', title: 'Network Coordinates in the Wild', publication: 'USENIX NSDI', year: '2007', url: 'https://www.seltzer.com/assets/publications/Network-Coordinates-in-the-Wild.htm' },
    { id: 8, authors: 'G. Wang, B. Zhang, and T. S. E. Ng', title: 'Towards Network Triangle Inequality Violation Aware Distributed Systems', publication: 'ACM Internet Measurement Conference', year: '2007', url: 'https://conferences.sigcomm.org/imc/2007/papers/imc145.pdf' },
    { id: 9, authors: 'B. Huffaker et al.', title: 'On the Internet Delay Space Dimensionality', publication: 'ACM Internet Measurement Conference', year: '2008', url: 'https://www.cs.cornell.edu/~rdk/papers/imc08.pdf' },
    { id: 10, authors: 'M. Boguñá, F. Papadopoulos, and D. Krioukov', title: 'Sustaining the Internet with Hyperbolic Mapping', publication: 'Nature Communications 1, 62', year: '2010', url: 'https://www.nature.com/articles/ncomms1063' },
    { id: 11, authors: 'A. Singla et al.', title: 'The Internet at the Speed of Light', publication: 'ACM HotNets', year: '2014', url: 'https://conferences.sigcomm.org/hotnets/2014/papers/hotnets-XIII-final111.pdf' },
    { id: 12, authors: 'Y. Vardi', title: 'Network Tomography: Estimating Source–Destination Traffic Intensities from Link Data', publication: 'Journal of the American Statistical Association 91(433)', year: '1996', url: 'https://doi.org/10.1080/01621459.1996.10476697' },
    { id: 13, authors: 'PeeringDB', title: 'PeeringDB documentation and API', publication: 'PeeringDB', year: '2026', url: 'https://docs.peeringdb.com/' },
    { id: 14, authors: 'A. Myers, E. Munch, and F. A. Khasawneh', title: 'Persistent Homology of Complex Networks for Dynamic State Detection', publication: 'Physical Review E 100, 022314', year: '2019', url: 'https://arxiv.org/abs/1904.07403' },
  ];

  constructor() {
    this.title.setTitle('What Shape Is the Internet? — Working Theory');
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
