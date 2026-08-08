// Mirrors Program.cs: RequiredLength = 8, RequireNonAlphanumeric = true,
// plus Identity's untouched defaults (digit/lower/upper). If that policy
// changes, this is the one place to update — worth moving to a shared

import { AbstractControl, ValidationErrors } from "@angular/forms";

// validators file once a second form (e.g. change-password) needs it too.
export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  const valid =
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^a-zA-Z0-9]/.test(value);

  return valid ? null : { passwordStrength: true };
}