import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { UserProfileDto } from '../../shared/models/identity/profile';
import { ProfileService } from '../services/identity/profile';

export const sellerProfileResolver: ResolveFn<UserProfileDto | null> = async (route) => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  const id = route.paramMap.get('id');
  if (!id) {
    router.navigate(['/not-found']);
    return null;
  }

  try {
    return await profileService.getProfileById(id);
  } catch {
    router.navigate(['/not-found']); // covers both "no such user" and "not a seller" — both 404 from the backend
    return null;
  }
};
