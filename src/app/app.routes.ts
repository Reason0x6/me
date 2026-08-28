import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero.component';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  {
    path: 'jazz-device',
    loadComponent: () =>
      import('./features/jazz-device/jazz-device.component').then((module) => module.JazzDeviceComponent),
  },
  {
    path: 'tp-7-youtube',
    loadComponent: () =>
      import('./features/tp7-youtube/tp7-youtube.component').then((module) => module.Tp7YoutubeComponent),
  },
];
