import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { defaultRouteForRole, normalizeRole, StaffRole } from './role-access';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  const role = normalizeRole(auth.user()?.role?.name);
  if (!role) {
    auth.logout();
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  const allowedRoles = (route.data?.['roles'] ?? []) as StaffRole[];
  return allowedRoles.includes(role) ? true : router.createUrlTree([defaultRouteForRole(role)]);
};
