import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./working-theory/working-theory.component').then((module) => module.WorkingTheoryComponent),
  },
  {
    path: 'notes/:slug',
    loadComponent: () =>
      import('./working-theory/thought-detail.component').then((module) => module.ThoughtDetailComponent),
  },
  {
    path: 'papers/what-shape-is-the-internet',
    loadComponent: () =>
      import('./working-theory/internet-shape-paper.component').then((module) => module.InternetShapePaperComponent),
  },
  {
    path: 'papers/how-many-facts-does-reality-contain',
    loadComponent: () =>
      import('./working-theory/world-rank-paper.component').then((module) => module.WorldRankPaperComponent),
  },
  {
    path: 'papers/zero-trust-voice-verification',
    loadComponent: () =>
      import('./working-theory/zero-trust-voice-paper.component').then((module) => module.ZeroTrustVoicePaperComponent),
  },
  {
    path: 'editorials/:slug',
    loadComponent: () =>
      import('./working-theory/counter-strike-editorial.component').then((module) => module.CounterStrikeEditorialComponent),
  },
  { path: '**', redirectTo: '' },
];
