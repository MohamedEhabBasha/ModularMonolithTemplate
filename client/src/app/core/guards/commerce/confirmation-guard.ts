import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const confirmationGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const hasMerchantOrderId = route.queryParamMap.has('merchant_order_id');

  if (hasMerchantOrderId) return true;

  router.navigateByUrl('/shop');
  return false;
};
