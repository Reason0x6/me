import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./working-theory/counter-strike-hub.component').then((module) => module.CounterStrikeHubComponent),
  },
  {
    path: 'counter-strike',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'counter-strike/editorials/how-post-ropz-vitality-rebuilt-the-superteam',
    redirectTo: 'editorials/how-ropz-era-vitality-rebuilt-the-superteam',
    pathMatch: 'full',
  },
  {
    path: 'counter-strike/editorials/:slug',
    redirectTo: 'editorials/:slug',
    pathMatch: 'full',
  },
  {
    path: 'editorials/how-post-ropz-vitality-rebuilt-the-superteam',
    redirectTo: 'editorials/how-ropz-era-vitality-rebuilt-the-superteam',
    pathMatch: 'full',
  },
  {
    path: 'editorials/:slug',
    loadComponent: () =>
      import('./working-theory/counter-strike-editorial.component').then((module) => module.CounterStrikeEditorialComponent),
  },
  { path: '**', redirectTo: '' },
];
