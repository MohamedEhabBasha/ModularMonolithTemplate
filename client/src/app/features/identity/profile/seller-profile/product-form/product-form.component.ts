import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../../shared/models/commerce/products/product';
import { SellerService } from '../../../../../core/services/identity/seller';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { SellerProductDto } from '../../../../../shared/models/commerce/products/seller-product';
import { PhotoDto } from '../../../../../shared/models/photo-dto';

export interface ProductFormDialogData {
  product?: SellerProductDto;
}

interface PhotoPreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, MatIcon, MatFormField, MatLabel, MatError, MatButton, MatInput],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  protected dialogRef = inject(MatDialogRef<ProductFormComponent>, { optional: true });
  private data = inject<ProductFormDialogData>(MAT_DIALOG_DATA, { optional: true });
  private fb = inject(FormBuilder);
  private sellerService = inject(SellerService);

  created = output<Product>();

  protected readonly isEditMode = !!this.data?.product;
  private readonly productId = this.data?.product?.id ?? null;

  submitting = signal(false);
  error = signal<string | null>(null);
  uploadingPhoto = signal(false);
  removingPublicId = signal<string | null>(null);

  newPhotos = signal<PhotoPreview[]>([]); // create mode: staged, uploaded on submit
  existingPhotos = signal<PhotoDto[]>(this.data?.product?.pictures ?? []); // edit mode

  form = this.fb.nonNullable.group({
    name: [this.data?.product?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    description: [this.data?.product?.description ?? '', [Validators.maxLength(2000)]],
    price: [this.data?.product?.price ?? 0, [Validators.required, Validators.min(0.01)]],
    type: [this.data?.product?.type ?? '', [Validators.required, Validators.maxLength(50)]],
    brand: [this.data?.product?.brand ?? '', [Validators.required, Validators.maxLength(50)]],
    availableQuantity: [
      this.data?.product?.availableQuantity ?? 0,
      [Validators.required, Validators.min(0)],
    ],
  });

  cancel(): void {
    this.dialogRef?.close();
  }

  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    if (this.isEditMode) {
      files.forEach((file) => this.uploadPhotoNow(file));
    } else {
      const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
      this.newPhotos.update((current) => [...current, ...previews]);
    }
  }

  removeNewPhoto(index: number) {
    const removed = this.newPhotos()[index];
    URL.revokeObjectURL(removed.url);
    this.newPhotos.update((current) => current.filter((_, i) => i !== index));
  }

  private async uploadPhotoNow(file: File) {
    if (!this.productId) return;
    this.uploadingPhoto.set(true);
    this.error.set(null);
    try {
      const photo = await this.sellerService.addProductPhoto(this.productId, file);
      this.existingPhotos.update((current) => [...current, photo]);
    } catch {
      this.error.set('Could not upload photo. Please try again.');
    } finally {
      this.uploadingPhoto.set(false);
    }
  }

  async removeExistingPhoto(publicId: string | null) {
    if (!this.productId || !publicId) return;
    if (this.existingPhotos().length <= 1) {
      this.error.set('A product must have at least one photo.');
      return;
    }
    this.removingPublicId.set(publicId);
    this.error.set(null);
    try {
      await this.sellerService.removeProductPhoto(this.productId, publicId);
      this.existingPhotos.update((current) => current.filter((p) => p.publicId !== publicId));
    } catch {
      this.error.set('Could not remove photo. Please try again.');
    } finally {
      this.removingPublicId.set(null);
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.isEditMode && this.newPhotos().length === 0) {
      this.error.set('Add at least one photo.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const raw = this.form.getRawValue();

    try {
      if (this.isEditMode) {
        await this.sellerService.updateProduct(this.productId!, raw);
        this.dialogRef?.close(true);
      } else {
        const formData = new FormData();
        formData.append('Name', raw.name);
        formData.append('Description', raw.description);
        formData.append('Price', raw.price.toString());
        formData.append('Type', raw.type);
        formData.append('Brand', raw.brand);
        formData.append('AvailableQuantity', raw.availableQuantity.toString());
        this.newPhotos().forEach((p) => formData.append('Photos', p.file));

        const product = await this.sellerService.createProduct(formData);
        this.newPhotos().forEach((p) => URL.revokeObjectURL(p.url));
        this.created.emit(product);
        this.dialogRef?.close(product);
      }
    } catch {
      this.error.set(
        this.isEditMode
          ? 'Could not save changes. Please try again.'
          : 'Could not create the product. Please try again.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
