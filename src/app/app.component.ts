import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from "./hero/hero.component";
import { CardsComponent } from "./cards/cards.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeroComponent, CardsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'g-austin';
}
