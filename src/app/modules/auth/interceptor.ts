import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer token` }
  });
  return next(authReq);
}
