import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let authenticated = true;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authenticated = true;
    const user = signal({ role: { name: 'waiter' } } as User);
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'logout'], {
      user,
    });
    auth.isAuthenticated.and.callFake(() => authenticated);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  function run(roles: string[], url = '/cash') {
    const route = { data: { roles } } as unknown as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => roleGuard(route, state));
  }

  it('allows a role declared by the route', () => {
    expect(run(['admin', 'waiter'])).toBeTrue();
  });

  it('redirects an unauthorized role to its workspace', () => {
    auth.user.set({ role: { name: 'kitchen' } } as User);

    run(['admin', 'waiter']);

    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/kitchen']);
  });

  it('redirects unauthenticated users preserving the requested URL', () => {
    authenticated = false;

    run(['admin'], '/reports');

    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/login'], {
      queryParams: { returnUrl: '/reports' },
    });
  });
});
