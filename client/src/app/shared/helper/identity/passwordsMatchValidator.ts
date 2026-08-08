import { AbstractControl, ValidationErrors } from "@angular/forms";

// Lives on confirmPassword (not the FormGroup) so mat-error can bind to
// it the normal way. Re-checked whenever password changes
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.parent?.get('password')?.value;
  return !password || password === control.value ? null : { passwordsMismatch: true };
}