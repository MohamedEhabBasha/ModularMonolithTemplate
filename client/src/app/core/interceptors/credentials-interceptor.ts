import { HttpInterceptorFn } from '@angular/common/http';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  let cloned = req.clone({ withCredentials: true }); // send cookies cross-origin

  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (isMutating) {
    const token = readCookie('XSRF-TOKEN');
    if (token) {
      cloned = cloned.clone({ setHeaders: { 'X-XSRF-TOKEN': token } });
    }
  }

  return next(cloned);
};
