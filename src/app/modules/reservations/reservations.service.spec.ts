import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReservationsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ReservationsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('queries table availability for the selected schedule and party size', () => {
    service
      .availability({
        reservationAt: '2099-08-03T20:00:00.000Z',
        guests: 4,
      })
      .subscribe();

    const request = http.expectOne(
      (candidate) => candidate.url === `${environment.apiUrl}/reservations/availability`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('reservationAt')).toBe(
      '2099-08-03T20:00:00.000Z',
    );
    expect(request.request.params.get('guests')).toBe('4');
  });

  it('sends only the selected reservation status transition', () => {
    service.status('reservation-1', 'CONFIRMED').subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/reservations/reservation-1/status`,
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ status: 'CONFIRMED' });
  });
});
