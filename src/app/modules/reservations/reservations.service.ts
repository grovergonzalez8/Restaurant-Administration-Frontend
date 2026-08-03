import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { RestaurantTable } from '../../core/models/table.model';

export interface ReservationAvailability {
  reservationAt: string;
  guests: number;
}

export interface CreateReservationPayload extends ReservationAvailability {
  tableId: string;
  customerName: string;
  phone: string;
  email?: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private readonly url = `${environment.apiUrl}/reservations`;

  constructor(private readonly http: HttpClient) {}

  upcoming() {
    return this.http.get<Reservation[]>(`${this.url}/upcoming`);
  }

  availability(query: ReservationAvailability) {
    const params = new HttpParams()
      .set('reservationAt', query.reservationAt)
      .set('guests', query.guests);
    return this.http.get<RestaurantTable[]>(`${this.url}/availability`, { params });
  }

  create(payload: CreateReservationPayload) {
    return this.http.post<Reservation>(this.url, payload);
  }

  status(id: string, status: ReservationStatus) {
    return this.http.put<Reservation>(`${this.url}/${id}/status`, { status });
  }
}
