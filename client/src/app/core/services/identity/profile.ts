import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PhotoDto, UpdateBrandNameDto } from '../../../shared/models/identity/user';
import { UserProfileDto } from '../../../shared/models/identity/profile';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getMyProfile(): Promise<UserProfileDto> {
    return firstValueFrom(this.http.get<UserProfileDto>(`${this.baseUrl}profile/me`));
  }

  getProfileById(id: string): Promise<UserProfileDto> {
    return firstValueFrom(this.http.get<UserProfileDto>(`${this.baseUrl}profile/${id}`));
  }

  addProfilePhoto(file: File): Promise<PhotoDto> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<PhotoDto>(`${this.baseUrl}profile/photo`, formData));
  }

  deleteProfilePhoto(): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}profile/photo`));
  }

  updateBrandName(dto: UpdateBrandNameDto): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.baseUrl}profile/me/brand-name`, dto));
  }
}
