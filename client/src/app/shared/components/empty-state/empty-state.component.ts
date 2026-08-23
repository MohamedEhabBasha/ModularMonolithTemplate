import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="bg-white flex flex-col items-center justify-center text-center space-y-6 py-16 border border-gray-300 rounded-lg">
      @if (icon()) {
        <mat-icon class="text-5xl! w-12! h-12! text-secondary/40">{{ icon() }}</mat-icon>
      }
      <h3 class="text-lg font-medium text-secondary">{{ title() }}</h3>
      @if (message()) {
        <p class="text-sm text-secondary/70 max-w-sm">{{ message() }}</p>
      }
      <ng-content select="[emptyStateAction]" />
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<string>();
  title = input.required<string>();
  message = input<string>();
}