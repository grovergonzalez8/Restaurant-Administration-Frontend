import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
@Injectable({ providedIn: 'root' })
export class ReservationsService { private readonly url = `${environment.apiUrl}/reservations`; constructor(private http: HttpClient) {} upcoming() { return this.http.get<Reservation[]>(`${this.url}/upcoming`); } create(payload: Omit<Reservation, 'id' | 'status'>) { return this.http.post<Reservation>(this.url, payload); } status(id: string, status: ReservationStatus) { return this.http.put<Reservation>(`${this.url}/${id}/status`, { status }); } }
