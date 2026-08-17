import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PaymentHubService } from '../../services/commerce/payment-hub';

export const confirmationGuard: CanActivateFn = (route, state) => {
  const paymentHub = inject(PaymentHubService);
  const router = inject(Router);

  if (paymentHub.confirmationCanActivate()) return true;

  router.navigateByUrl('/shop');
  return false;
};
