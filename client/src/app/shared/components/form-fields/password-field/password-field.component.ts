import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FieldErrorMessages } from '../../../models/field-error-messages';

@Component({
  selector: 'app-password-field',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSuffix,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './password-field.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordFieldComponent {
  readonly control = input.required<FormControl<string>>();
  readonly label = input<string>('Password');
  readonly autocomplete = input<string>('new-password');
  readonly errorMessages = input<FieldErrorMessages>({});
  readonly showRequirements = input(false);

  protected readonly hide = signal(true);
  private readonly value = signal('');

  constructor() {
    // effect() defers its body the same way computed() does — it only
    // runs once inputs are actually live, so reading this.control() here
    // is safe. Also re-subscribes if a *different* FormControl instance
    // is ever passed in, which the old field-initializer toSignal()
    // silently wouldn't have done.
    effect((onCleanup) => {
      const control = this.control();
      this.value.set(control.value);
      const subscription = control.valueChanges.subscribe((v) => this.value.set(v));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected readonly requirements = computed(() => {
    const value = this.value();
    return {
      minLength: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      digit: /[0-9]/.test(value),
      special: /[^a-zA-Z0-9]/.test(value),
    };
  });

  protected activeErrorMessage(): string | undefined {
    const errors = this.control().errors;
    if (!errors) return undefined;

    const messages = this.errorMessages();
    const key = Object.keys(messages).find((k) => errors[k]);
    return key ? messages[key] : undefined;
  }

  protected toggleVisibility(event: MouseEvent): void {
    event.preventDefault();
    this.hide.update((hidden) => !hidden);
  }
}
