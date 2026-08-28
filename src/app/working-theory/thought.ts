export type ThoughtKind = 'Note' | 'Essay' | 'Model' | 'Question' | 'Standard' | 'White paper';
export type ThoughtState = 'Spark' | 'Working' | 'Developed' | 'Revisited';

export interface ThoughtReference {
  readonly label: string;
  readonly url: string;
}

export interface Thought {
  readonly number: string;
  readonly slug: string;
  readonly title: string;
  readonly dek: string;
  readonly kind: ThoughtKind;
  readonly state: ThoughtState;
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly readingMinutes: number;
  readonly themes: readonly string[];
  readonly thesis: string;
  readonly body: readonly string[];
  readonly references?: readonly ThoughtReference[];
  readonly related: readonly string[];
  readonly featured?: boolean;
  readonly path?: string;
}
