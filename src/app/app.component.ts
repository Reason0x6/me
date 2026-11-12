import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-root', standalone: true,
  templateUrl: './app.component.html', styleUrl: './app.component.css'
})
export class AppComponent {
  readonly hintVisible = signal(false);
  readonly solved = signal<number[]>(this.readProgress());

  toggleHint(): void { this.hintVisible.update(visible => !visible); }

  @HostListener('window:pageshow')
  @HostListener('window:storage')
  refreshProgress(): void { this.solved.set(this.readProgress()); }

  private readProgress(): number[] {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('reason6.transmissions') || '[]');
      const valid: number[] = Array.isArray(saved)
        ? saved.filter((n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 6)
        : [];
      if (localStorage.getItem('reason6.signal.acknowledged') === '006') valid.push(1);
      return [...new Set(valid)];
    } catch { return []; }
  }
}
