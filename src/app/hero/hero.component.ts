import { Component } from '@angular/core';
import { CardsComponent } from "../cards/cards.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [CardsComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

}
