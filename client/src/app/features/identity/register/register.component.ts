import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService } from '../../../core/services/identity/account';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { passwordStrengthValidator } from '../../../shared/helper/identity/passwordStrengthValidator';
import { passwordsMatchValidator } from '../../../shared/helper/identity/passwordsMatchValidator';
import { AccountType, RegisterRequest } from '../../../shared/models/identity/register';
import { TextFieldComponent } from '../../../shared/components/form-fields/text-field/text-field.component';
import { PasswordFieldComponent } from '../../../shared/components/form-fields/password-field/password-field.component';
import { RadioOption, RadioGroupFieldComponent } from '../../../shared/components/form-fields/radio-group-field/radio-group-field.component';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatProgressSpinner,
    TextFieldComponent,
    PasswordFieldComponent,
    RadioGroupFieldComponent
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  protected readonly serverValidationErrors = signal<string[] | undefined>(undefined);
  protected readonly loading = signal(false);

  protected readonly accountTypeOptions: RadioOption<AccountType>[] = [
    {
      value: 'Buyer',
      label: 'Buy',
      description: 'Shop from sellers on the platform',
      icon: 'shopping_bag',
    },
    {
      value: 'Seller',
      label: 'Sell',
      description: 'List and manage your own products',
      icon: 'storefront',
    },
  ];

  protected readonly registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required, passwordsMatchValidator]],
    accountType: this.fb.control<AccountType>('Buyer', { validators: [Validators.required] }),
  });

  constructor() {
    // Reactive Forms only re-runs a control's own validators when its own
    // value changes — confirmPassword won't notice password changed
    // unless told to.
    this.registerForm.controls.password.valueChanges.pipe(takeUntilDestroyed()).subscribe(() =>
      this.registerForm.controls.confirmPassword.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      }),
    );
  }

  protected async submit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.serverValidationErrors.set(undefined);
    this.loading.set(true);

    const raw = this.registerForm.getRawValue();
    const model: RegisterRequest = {
      email: raw.email,
      password: raw.password,
      firstName: raw.firstName,
      lastName: raw.lastName,
      accountType: raw.accountType,
    };

    try {
      await this.accountService.register(model);
      await this.router.navigateByUrl('/shop');
    } catch (errors) {
      this.serverValidationErrors.set(errors as string[]);
    } finally {
      this.loading.set(false);
    }
  }
}
