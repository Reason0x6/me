import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero.component';
import { ScriptsComponent } from './scripts/scripts.component';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'scripts', component: ScriptsComponent }
];
