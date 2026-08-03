import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 400:
          if (err.error?.errors) {
            const modelStateErrors = Object.values(err.error.errors).flat() as string[];
            return throwError(() => modelStateErrors);
          }
          snackbar.error(err.error?.title ?? err.error ?? 'Bad request');
          break;

        case 401:
          // No login route yet — once one exists, add
          // router.navigateByUrl('/login', { queryParams: { returnUrl: router.url } })
          // here alongside the snackbar.
          snackbar.error(err.error?.title ?? err.error ?? 'You are not authorized');
          break;

        case 403:
          snackbar.error('You do not have permission to do that.');
          break;

        case 404:
          router.navigateByUrl('/not-found');
          break;

        case 500: {
          const navigationExtras: NavigationExtras = { state: { error: err.error } };
          router.navigateByUrl('/server-error', navigationExtras);
          break;
        }

        case 0:
          snackbar.error('Unable to reach the server. Check your connection.');
          break;

        default:
          snackbar.error('Something went wrong. Please try again.');
          break;
      }

      return throwError(() => err);
    }),
  );
};
