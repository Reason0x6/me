import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from "./hero/hero.component";
import { CardsComponent } from "./cards/cards.component";
import { ScriptsComponent } from './scripts/scripts.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'g-austin';
}

export interface Card {
  title: string;
  description: string;
  link?: string;
}