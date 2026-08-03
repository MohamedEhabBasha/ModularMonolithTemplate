import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ServerErrorState {
  readonly statusCode?: number;
  readonly message?: string;
  readonly details?: string;
}

@Component({
  selector: 'app-server-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.css',
})
export class ServerErrorComponent {
    protected readonly error: ServerErrorState =
    (typeof history !== 'undefined' ? (history.state as ServerErrorState) : null) ?? {};
}
