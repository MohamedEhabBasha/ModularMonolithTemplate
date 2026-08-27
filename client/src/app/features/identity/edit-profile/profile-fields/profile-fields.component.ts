import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AccountService } from '../../../../core/services/identity/account';
import { ProfileService } from '../../../../core/services/identity/profile';
import { Address } from '../../../../shared/models/identity/user';

type SectionKey = 'photo' | 'basicInfo' | 'address' | 'phoneNumber';

@Component({
  selector: 'app-profile-fields',
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormField,
    MatInput,
    MatButton,
    MatIcon,
    MatLabel,
    MatError
  ],
  templateUrl: './profile-fields.component.html',
  styleUrl: './profile-fields.component.css',
})
export class ProfileFieldsComponent implements OnInit {
  private accountService = inject(AccountService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  loadError = signal(false);
  saving = signal<SectionKey | null>(null);
  errors = signal<Partial<Record<SectionKey, string>>>({});

  photoUrl = signal<string | null>(null);

  basicInfoForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
  });

  addressForm = this.fb.nonNullable.group({
    line1: ['', [Validators.required, Validators.maxLength(200)]],
    line2: ['', [Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['', [Validators.maxLength(100)]],
    postalCode: ['', [Validators.maxLength(20)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
  });

  phoneNumberForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]],
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const userInfo = this.accountService.currentUser();

      if (!userInfo) {
        this.loadError.set(true);
        return;
      }

      const profile = await this.profileService.getMyProfile();
      this.photoUrl.set(profile.pictureUrl);

      this.basicInfoForm.setValue({ firstName: userInfo.firstName, lastName: userInfo.lastName });
      this.phoneNumberForm.setValue({ phoneNumber: userInfo.phoneNumber ?? '' });

      if (userInfo.address) {
        this.addressForm.setValue({
          line1: userInfo.address.line1,
          line2: userInfo.address.line2 ?? '',
          city: userInfo.address.city,
          state: userInfo.address.state ?? '',
          postalCode: userInfo.address.postalCode ?? '',
          country: userInfo.address.country,
        });
      }
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private setError(section: SectionKey, message: string) {
    this.errors.update((e) => ({ ...e, [section]: message }));
  }

  private clearError(section: SectionKey) {
    this.errors.update((e) => ({ ...e, [section]: undefined }));
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.uploadPhoto(file);
  }

  private async uploadPhoto(file: File) {
    this.saving.set('photo');
    this.clearError('photo');
    const previousUrl = this.photoUrl();
    const previewUrl = URL.createObjectURL(file);
    this.photoUrl.set(previewUrl);

    try {
      const result = await this.profileService.addProfilePhoto(file);
      this.photoUrl.set(result.url);
    } catch {
      this.photoUrl.set(previousUrl);
      this.setError('photo', 'Could not upload photo. Please try again.');
    } finally {
      URL.revokeObjectURL(previewUrl);
      this.saving.set(null);
    }
  }

  async removePhoto() {
    this.saving.set('photo');
    this.clearError('photo');
    const previousUrl = this.photoUrl();
    try {
      await this.profileService.deleteProfilePhoto();
      this.photoUrl.set(null);
    } catch {
      this.photoUrl.set(previousUrl);
      this.setError('photo', 'Could not remove photo. Please try again.');
    } finally {
      this.saving.set(null);
    }
  }

  async saveBasicInfo() {
    if (this.basicInfoForm.invalid) return;
    this.saving.set('basicInfo');
    this.clearError('basicInfo');
    try {
      await this.accountService.updateBasicInfo(this.basicInfoForm.getRawValue());
      this.basicInfoForm.markAsPristine();
    } catch {
      this.setError('basicInfo', 'Could not save your name. Please try again.');
    } finally {
      this.saving.set(null);
    }
  }

  async saveAddress() {
    if (this.addressForm.invalid) return;
    this.saving.set('address');
    this.clearError('address');
    try {
      const dto: Address = this.addressForm.getRawValue();
      await this.accountService.updateAddress(dto);
      this.addressForm.markAsPristine();
    } catch {
      this.setError('address', 'Could not save your address. Please try again.');
    } finally {
      this.saving.set(null);
    }
  }

  async savePhoneNumber() {
    if (this.phoneNumberForm.invalid) return;
    this.saving.set('phoneNumber');
    this.clearError('phoneNumber');
    try {
      await this.accountService.updatePhoneNumber(this.phoneNumberForm.getRawValue().phoneNumber);
      this.phoneNumberForm.markAsPristine();
    } catch {
      this.setError('phoneNumber', 'Could not save your phone number. Please try again.');
    } finally {
      this.saving.set(null);
    }
  }
}
