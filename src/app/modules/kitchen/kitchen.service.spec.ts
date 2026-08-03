import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { KitchenService } from './kitchen.service';

describe('KitchenService', () => {
  let service: KitchenService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KitchenService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(KitchenService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads active kitchen tickets', () => {
    service.active().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/kitchen/active`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('updates a kitchen ticket status', () => {
    service.updateStatus('ticket-1', 'in_progress').subscribe();

    const request = http.expectOne(`${environment.apiUrl}/kitchen/ticket-1/status`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ status: 'in_progress' });
    request.flush({ id: 'ticket-1', status: 'in_progress' });
  });
});
