import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/identity/account';
import { PreloaderReadyService } from '../services/preloader-ready';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const preloaderReady = inject(PreloaderReadyService);
  const router = inject(Router);

  // Wait for the same init signal the preloader uses — don't re-run bootstrap.
  return toObservable(preloaderReady.dismissed).pipe(
    filter((ready) => ready), // ignore false values
    take(1),
    map(() =>
      accountService.currentUser()
        ? true
        : router.createUrlTree(['/account/login'], { queryParams: { returnUrl: state.url } }), // Return a redirect destination; Angular handles the navigation.
    ),
  );
};
