import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RealtimeService } from '../../core/services/realtime.service';
import { AuthInterceptor } from './interceptor';

describe('AuthInterceptor', () => {
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let realtime: jasmine.SpyObj<RealtimeService>;

  beforeEach(() => {
    localStorage.setItem('token', 'revoked-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1' }));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    realtime = jasmine.createSpyObj<RealtimeService>('RealtimeService', [
      'disconnect',
    ]);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: RealtimeService, useValue: realtime },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('clears a revoked session and returns to login on unauthorized response', () => {
    const client = TestBed.inject(HttpClient);
    client.get('/protected').subscribe({ error: () => undefined });

    http.expectOne('/protected').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(realtime.disconnect).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
