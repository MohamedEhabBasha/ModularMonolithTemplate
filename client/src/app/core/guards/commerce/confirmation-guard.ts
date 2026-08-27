import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CommerceHubService } from '../../services/commerce/commerce-hub';


export const confirmationGuard: CanActivateFn = (route, state) => {
  const commerceHub = inject(CommerceHubService);
  const router = inject(Router);

  if (commerceHub.confirmationCanActivate()) return true;

  router.navigateByUrl('/shop');
  return false;
};
