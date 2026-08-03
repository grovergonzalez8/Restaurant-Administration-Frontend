import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { StaffService } from './staff.service';

describe('StaffService', () => {
  let service: StaffService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StaffService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads users and roles required by staff management', () => {
    service.users().subscribe();
    service.roles().subscribe();

    expect(http.expectOne(`${environment.apiUrl}/users`).request.method).toBe('GET');
    expect(http.expectOne(`${environment.apiUrl}/roles`).request.method).toBe('GET');
  });

  it('creates a user without exposing a client-generated role name', () => {
    const payload = {
      name: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'secret1',
      roleId: 3,
    };
    service.create(payload).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
  });

  it('updates a user through its protected identifier', () => {
    const payload = {
      name: 'Ana Pérez',
      email: 'ana@example.com',
      roleId: 2,
    };
    service.update('user-1', payload).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/users/user-1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
  });

  it('changes staff access without resending profile data', () => {
    service.setActive('user-1', false).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/users/user-1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ isActive: false });
  });
});
