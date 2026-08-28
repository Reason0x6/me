export type RightsStatus = 'redistributable' | 'link-only' | 'review';

export interface ResearchPaper {
  readonly id: string;
  readonly title: string;
  readonly authors: readonly string[];
  readonly organization: string;
  readonly year: number;
  readonly publishedLabel: string;
  readonly summary: string;
  readonly topics: readonly string[];
  readonly sourceType: 'Government' | 'Institutional' | 'Repository' | 'Independent';
  readonly sourceLabel: string;
  readonly sourceUrl: string;
  readonly doi?: string;
  readonly license: string;
  readonly licenseUrl?: string;
  readonly rightsStatus: RightsStatus;
  readonly rightsEvidence: string;
  readonly pages?: number;
  readonly format: 'PDF' | 'HTML';
  readonly addedAt: string;
  readonly citations?: number;
  readonly featured?: boolean;
}

