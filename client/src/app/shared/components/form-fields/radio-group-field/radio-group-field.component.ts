import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldErrorMessages } from '../../../models/field-error-messages';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton } from '@angular/material/radio';

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'app-radio-group-field',
  imports: [ReactiveFormsModule, MatIcon, MatRadioButton],
  templateUrl: './radio-group-field.component.html',
  styleUrl: './radio-group-field.component.css',
})
export class RadioGroupFieldComponent<T extends string = string> {
  readonly control = input.required<FormControl<T>>();
  readonly options = input.required<RadioOption<T>[]>();
  readonly label = input<string>();
  readonly errorMessages = input<FieldErrorMessages>({});

  protected activeErrorMessage(): string | undefined {
    const errors = this.control().errors;
    if (!errors) return undefined;

    const messages = this.errorMessages();
    const key = Object.keys(messages).find((k) => errors[k]);
    return key ? messages[key] : undefined;
  }
}
