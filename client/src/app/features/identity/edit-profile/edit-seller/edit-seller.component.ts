import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ProfileFieldsComponent } from '../profile-fields/profile-fields.component';
import { ProfileService } from '../../../../core/services/identity/profile';

@Component({
  selector: 'app-edit-seller',
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    ProfileFieldsComponent,
  ],
  templateUrl: './edit-seller.component.html',
  styleUrl: './edit-seller.component.css',
})
export class EditSellerComponent implements OnInit {
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  private readonly BRAND_NAME_COOLDOWN_DAYS = 30; // keep in sync with SellerProfile.Rename() on the backend

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  brandNameChangedAt = signal<string | null>(null);

  daysUntilBrandNameEditable = computed(() => {
    const changedAt = this.brandNameChangedAt();
    if (!changedAt) return 0;
    const elapsedDays = (Date.now() - new Date(changedAt).getTime()) / 86_400_000;
    return Math.max(0, Math.ceil(this.BRAND_NAME_COOLDOWN_DAYS - elapsedDays));
  });
  canEditBrandName = computed(() => this.daysUntilBrandNameEditable() === 0);

  brandNameForm = this.fb.nonNullable.group({
    brandName: ['', [Validators.required, Validators.maxLength(50)]],
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const profile = await this.profileService.getMyProfile();
      this.brandNameForm.setValue({ brandName: profile.brandName ?? '' });
      this.brandNameChangedAt.set(profile.brandNameChangedAt ?? null);
    } catch {
      this.error.set('Could not load your brand info.');
    } finally {
      this.loading.set(false);
    }
  }

  async saveBrandName() {
    if (this.brandNameForm.invalid || !this.canEditBrandName()) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.profileService.updateBrandName(this.brandNameForm.getRawValue());
      this.brandNameChangedAt.set(new Date().toISOString());
      this.brandNameForm.markAsPristine();
    } catch {
      this.error.set('Could not update brand name. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
