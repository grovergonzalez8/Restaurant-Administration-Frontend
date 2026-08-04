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
});
