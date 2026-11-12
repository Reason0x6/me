import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly hintVisible = signal(false);
  readonly acknowledged = signal(this.readAcknowledgement());

  toggleHint(): void {
    this.hintVisible.update((visible) => !visible);
  }

  private readAcknowledgement(): boolean {
    try {
      return localStorage.getItem('reason6.signal.acknowledged') === '006';
    } catch {
      return false;
    }
  }
}
