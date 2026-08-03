import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { RealtimeService } from '../../core/services/realtime.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let realtime: jasmine.SpyObj<RealtimeService>;

  beforeEach(() => {
    localStorage.clear();
    realtime = jasmine.createSpyObj<RealtimeService>('RealtimeService', [
      'reconnect',
      'disconnect',
    ]);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RealtimeService, useValue: realtime },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('reconnects realtime after storing a successful login token', () => {
    service.login({ email: 'waiter@example.com', password: 'secret' }).subscribe();

    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ access_token: 'jwt-token' });

    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(realtime.reconnect).toHaveBeenCalledTimes(1);
  });

  it('disconnects realtime and clears the session on logout', () => {
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1' }));

    service.logout();

    expect(realtime.disconnect).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
