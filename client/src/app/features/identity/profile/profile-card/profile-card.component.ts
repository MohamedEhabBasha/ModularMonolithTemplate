import { Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-card',
  imports: [RouterLink, MatIcon, MatButton],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.css',
})
export class ProfileCardComponent {
  readonly pictureUrl = input<string | null>(null);
  readonly name = input.required<string>();
  readonly showEditButton = input(false);
}
