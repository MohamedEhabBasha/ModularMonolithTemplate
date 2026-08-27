import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../services/identity/account';
import { PreloaderReadyService } from '../../services/preloader-ready';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AccountRoles } from '../../../shared/models/identity/account-roles';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const preloaderReady = inject(PreloaderReadyService);
  const router = inject(Router);

  return toObservable(preloaderReady.dismissed).pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      const user = accountService.currentUser();

      if (!user) {
        // Not logged in at all — same treatment as authGuard: send to login, remember where they were headed.
        return router.createUrlTree(['/account/login'], { queryParams: { returnUrl: state.url } });
      }

      return user.roles.includes(AccountRoles.Admin)
        ? true
        : router.createUrlTree(['/shop']); // logged in, just not an admin — home, not login
    }),
  );
};
