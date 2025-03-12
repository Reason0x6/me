import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for directives like *ngFor

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],  // Make sure CommonModule is included here
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent{

  cards = [
    { title: 'Graduated with Class 1 Honors', description: 'Graduated with a Class 1 Honors degree in Software Engineering, including three Faculty Commendation List honors in 2018, 2022, and 2023.' },
    { title: 'Programming Languages', description: 'Proficient in TypeScript, JavaScript, .NET, and Java, with expertise in developing dynamic and scalable applications.' },
    { title: 'Frontend Development', description: 'Experienced with Angular, Cordova, HTML, and CSS, building responsive and user-friendly interfaces for web and mobile apps.' },
    { title: 'Backend Development', description: 'Skilled in .NET, REST APIs, and SQL, with a focus on creating robust, scalable, and efficient server-side applications.' },
    { title: 'DevOps & Cloud', description: 'Proficient in Azure DevOps, CI/CD pipelines, and Infrastructure as Code (IaC) to automate and streamline development and deployment processes.' },
    { title: 'Tools & Technologies', description: 'Experienced with Git, Cypress for testing, and both Unit & E2E Testing, ensuring high-quality code and continuous integration.' },
    { title: 'Methodologies', description: 'Familiar with Agile, Scrum practices, conducting Code Reviews, and Debugging to deliver efficient, collaborative, and high-performing software.' },
    { title: 'Mechanical Keyboards', description: 'A passionate designer of mechanical keyboards, focusing on custom layouts, switches, keycaps, and modifying QMK firmware to create a tailored typing experience.' },
    { title: 'Gaming', description: 'I’m an avid gamer who enjoys discovering new and creative ways to play. Whether it’s experimenting with different strategies or finding unique team combinations, I love pushing the boundaries of what’s possible.' }
  ];

  constructor() { }


}
