// pending-products.effects.ts
import { inject } from '@angular/core';

import { catchError, concatMap, from, map, of, switchMap } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PendingProductsActions } from './pending-products.actions';
import { AdminService } from '../../../../core/services/identity/admin';
import { CommerceHubService } from '../../../../core/services/commerce/commerce-hub';

export const load = createEffect(
  (actions$ = inject(Actions), admin = inject(AdminService)) =>
    actions$.pipe(
      ofType(PendingProductsActions.load),
      switchMap(() =>
        from(admin.getPendingProducts()).pipe(
          map((products) => PendingProductsActions.loadSuccess({ products })),
          catchError(() =>
            of(PendingProductsActions.loadFailure({ error: 'Could not load pending products.' })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const approve = createEffect(
  (actions$ = inject(Actions), admin = inject(AdminService)) =>
    actions$.pipe(
      ofType(PendingProductsActions.approve),
      concatMap(({ id }) =>
        from(admin.approveProduct(id)).pipe(
          map(() => PendingProductsActions.approveSuccess({ id })),
          catchError(() =>
            of(
              PendingProductsActions.approveFailure({
                error: 'Could not approve this product. Please try again.',
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const reject = createEffect(
  (actions$ = inject(Actions), admin = inject(AdminService)) =>
    actions$.pipe(
      ofType(PendingProductsActions.reject),
      concatMap(({ id, reason }) =>
        from(admin.rejectProduct(id, reason)).pipe(
          map(() => PendingProductsActions.rejectSuccess({ id })),
          catchError(() =>
            of(
              PendingProductsActions.rejectFailure({
                error: 'Could not reject this product. Please try again.',
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// SignalR → store bridge: replaces the effect() in PendingProductsComponent
// pending-products.effects.ts: the bridge becomes
export const reloadOnNewSubmission = createEffect(
  (hub = inject(CommerceHubService)) =>
    hub.productPendingReview$.pipe(map(() => PendingProductsActions.load())),
  { functional: true },
);

export const pendingProductsEffects = { load, approve, reject, reloadOnNewSubmission };