import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { RealtimeService } from '../../core/services/realtime.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const realtime = inject(RealtimeService);
  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        realtime.disconnect();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
