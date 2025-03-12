import { Component } from '@angular/core';
import { CardsComponent } from "../cards/cards.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [CardsComponent, CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(10px)' }), // Slight movement from right
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ opacity: 0, transform: 'translateX(-10px)' })),
      ]),
    ]),
  ],
})
export class HeroComponent {
  technologies: string[] = ['TypeScript', '.NET', 'DevOps', 'Angular', 'Azure', 'SQL', 'AWS', 'CloudFlare', 'C/C++', 'Cordova'];
  public currentTechnology: string = this.technologies[0];
  private index: number = 0;

  constructor() {
    setInterval(() => {
      this.index = (this.index + 1) % this.technologies.length;
      this.currentTechnology = ''; // Trigger animation
      setTimeout(() => {
        this.currentTechnology = this.technologies[this.index];
      }, 500); // Delay to allow fade-out effect before updating text
    }, 5000); // Change every 10 seconds
  }
}
