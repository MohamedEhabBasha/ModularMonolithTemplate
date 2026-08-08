import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/identity/account';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequest } from '../../../shared/models/identity/login';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { TextFieldComponent } from '../../../shared/components/form-fields/text-field/text-field.component';
import { PasswordFieldComponent } from '../../../shared/components/form-fields/password-field/password-field.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatButton,
    TextFieldComponent,
    PasswordFieldComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly serverValidationErrors = signal<string[] | undefined>(undefined);
  protected readonly loading = signal(false);

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected async submit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.serverValidationErrors.set(undefined);
    this.loading.set(true);

    const model: LoginRequest = this.loginForm.getRawValue();

    try {
      await this.accountService.login(model);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/shop';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      let details: string[] | undefined;
      if (error instanceof HttpErrorResponse) {
        const problemErrors = error.error?.errors as Record<string, string[]> | undefined;
        details = problemErrors
          ? Object.values(problemErrors).flat()
          : error.error?.detail
            ? [error.error.detail]
            : undefined;
      }

      this.serverValidationErrors.set(details ?? ['Something went wrong. Please try again.']);
    } finally {
      this.loading.set(false);
    }
  }
}
