import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./library/research-library.component').then((module) => module.ResearchLibraryComponent),
  },
  { path: '**', redirectTo: '' },
];
