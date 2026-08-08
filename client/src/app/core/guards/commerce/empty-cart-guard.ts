import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../../services/commerce/cart';
import { PreloaderReadyService } from '../../services/preloader-ready';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { SnackbarService } from '../../services/snackbar';

export const emptyCartGuard: CanActivateFn = () => {
  const snackbarService = inject(SnackbarService);
  const cartService = inject(CartService);
  const preloaderReady = inject(PreloaderReadyService);
  const router = inject(Router);

  return toObservable(preloaderReady.dismissed).pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (cartService.itemCount() > 0) return true;

      snackbarService.error('Your cart is empty!');
      return router.createUrlTree(['/shop']);
    }),
  );
};
