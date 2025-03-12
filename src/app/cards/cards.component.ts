import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for directives like *ngFor
import { Card } from '../app.component';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],  // Make sure CommonModule is included here
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent{

  cards: Card[] = [
        { title: 'Design and Implementation', description: 'Led system upgrades and integrations, developed scalable code, and collaborated on architecture and technical specs.' },
        { title: 'Backend Development', description: 'Skilled in .NET, REST APIs, and SQL, focusing on scalable, efficient server-side applications.' },
        { title: 'DevOps & Cloud', description: 'Designed CI/CD pipelines in Azure DevOps and implemented IaC for scalable, consistent cloud deployments.' },
        { title: 'Frontend Development', description: 'Experienced with Angular, Cordova, HTML, and CSS for responsive web and mobile apps.' },
        { title: 'Methodologies', description: 'Familiar with Agile and Scrum practices, including Code Reviews and Debugging.' },
        { title: 'Project Management & Collaboration', description: 'Collaborated with teams to deliver software solutions, participate in Agile processes, and provide technical leadership.' },
        { title: 'Code Review & Debugging', description: 'Conducted code reviews, optimized performance, and resolved bottlenecks for efficient applications.' },
        { title: 'Graduated with Class 1 Honors', description: 'Earned a Class 1 Honors degree in Software Engineering, with Faculty Commendation List honors in 2018, 2022, and 2023.' }
      ];

  constructor() { }


}
