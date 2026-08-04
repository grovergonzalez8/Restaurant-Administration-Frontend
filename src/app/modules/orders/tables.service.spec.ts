import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { TablesService } from './tables.service';

describe('TablesService', () => {
  let service: TablesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TablesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TablesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the operational dining-room overview', () => {
    service.overview().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/tables/overview`);
    expect(request.request.method).toBe('GET');
  });

  it('creates and updates tables through the admin contract', () => {
    const payload = { number: 8, capacity: 6, status: 'FREE' as const };
    service.create(payload).subscribe();
    service.update('table-1', payload).subscribe();

    const create = http.expectOne(`${environment.apiUrl}/tables`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(payload);
    const update = http.expectOne(`${environment.apiUrl}/tables/table-1`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(payload);
  });

  it('removes an unused table', () => {
    service.remove('table-1').subscribe();

    expect(http.expectOne(`${environment.apiUrl}/tables/table-1`).request.method).toBe(
      'DELETE',
    );
  });
});
