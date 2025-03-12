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
    
    { 
      title: "Design and Implementation", 
      description: "Led system upgrades and integrations, developing scalable software and collaborating with stakeholders on architecture and solutions." 
    },{ 
      title: "DevOps & Cloud", 
      description: "Proficient in Azure DevOps, AWS & Cloudflare, CI/CD pipelines, and Infrastructure as Code (IaC) to streamline development and deployment." 
    },
    { 
      title: "Project Management & Collaboration", 
      description: "Provided technical leadership, mentored engineers, and worked with teams on Agile processes to deliver high-quality software." 
    },
    { 
      title: "Backend Development", 
      description: "Skilled in .NET, REST APIs, and SQL to create scalable, efficient server-side applications." 
    },
    { 
      title: "Frontend Development", 
      description: "Experienced with Angular, Cordova, HTML, and CSS to build responsive web and mobile interfaces." 
    },
    { 
      title: "Serverless Architecture", 
      description: "Experienced in building serverless applications using cloud platforms like AWS Lambda and Azure Functions, reducing infrastructure management and scaling automatically." 
    },{
      title: "Interest in LLMs & Documentation",
      description: "Keen interest in exploring Large Language Models (LLMs) to enhance natural language processing tasks, with a focus on improving documentation automation and content generation."
    },
    { 
      title: "Tools & Technologies", 
      description: "Experienced with Git, and both Unit & E2E testing to ensure high-quality code and continuous integration." 
    },
    { 
      title: "Graduated with Class 1 Honors", 
      description: "Graduated with a Class 1 Honors degree in Software Engineering, with Faculty Commendations in 2018, 2022, and 2023." 
    },
  ]
  ;

  constructor() { }


}
