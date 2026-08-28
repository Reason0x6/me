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
  { path: '**', redirectTo: '' },
];
