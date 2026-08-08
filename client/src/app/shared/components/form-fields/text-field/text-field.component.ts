import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FieldErrorMessages } from '../../../models/field-error-messages';

@Component({
  selector: 'app-text-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError],
  templateUrl: './text-field.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldComponent {
  readonly control = input.required<FormControl<string>>();
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email'>('text');
  readonly autocomplete = input<string>('off');
  readonly errorMessages = input<FieldErrorMessages>({});

  protected activeErrorMessage(): string | undefined {
    const errors = this.control().errors;
    if (!errors) return undefined;

    const messages = this.errorMessages();
    const key = Object.keys(messages).find((k) => errors[k]);
    return key ? messages[key] : undefined;
  }
}
