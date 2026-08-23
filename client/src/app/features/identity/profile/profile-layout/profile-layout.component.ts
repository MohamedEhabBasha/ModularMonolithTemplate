import { Component, input, output } from '@angular/core';
import { ProfileCardComponent } from '../profile-card/profile-card.component';

@Component({
  selector: 'app-profile-layout',
  imports: [ProfileCardComponent],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css',
})
export class ProfileLayoutComponent {
  readonly pictureUrl = input<string | null>(null);
  readonly name = input.required<string>();
  readonly showEditButton = input(false);
}
