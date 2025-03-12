import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for directives like *ngFor
import { Card } from '../app.component';

@Component({
  selector: 'app-scripts',
  standalone: true,
  imports: [CommonModule],  // Make sure CommonModule is included here
  templateUrl: './scripts.component.html',
  styleUrls: ['./scripts.component.css'],
})
export class ScriptsComponent{

  cards: Card[] = [
    { title: 'Jira Ticket commit hook', description: "A Git commit-msg hook that automatically prepends a Jira ticket number (extracted from the branch name) to the commit message if it's not already present.", link: '/hooks/commit-msg' },
    { title: 'Recursive File and Content Search Script', description: "A Bash script that recursively searches a directory for files with names containing a given term or files that include the term in their content.",  link: '/scripts/search_term.sh'},
    { title: 'Detect API Keys & Sensitive Data', description: 'A Bash script that scans a Git repository, including its history, for exposed API keys, secrets, and sensitive credentials using regex patterns.', link: '/scripts/search_term.sh' },
];

  constructor() { }

}
