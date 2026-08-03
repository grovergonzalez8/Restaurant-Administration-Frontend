import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CashSessionsService } from './cash-sessions.service';

describe('CashSessionsService', () => {
  let service: CashSessionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CashSessionsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CashSessionsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('opens a cash session with the initial balance', () => {
    service.open(125.5).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/cash-sessions/open`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ openingBalance: 125.5 });
    request.flush({ id: 'cash-1' });
  });

  it('closes a cash session with the counted balance', () => {
    service.close('cash-1', 240).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/cash-sessions/cash-1/close`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ closingBalance: 240 });
    request.flush({ id: 'cash-1' });
  });

  it('requests the current session and its summary', () => {
    service.current().subscribe();
    const current = http.expectOne(`${environment.apiUrl}/cash-sessions/current`);
    expect(current.request.method).toBe('GET');
    current.flush(null);

    service.summary('cash-1').subscribe();
    const summary = http.expectOne(`${environment.apiUrl}/cash-sessions/cash-1/summary`);
    expect(summary.request.method).toBe('GET');
    summary.flush({});
  });
});
