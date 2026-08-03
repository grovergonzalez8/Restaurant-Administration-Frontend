import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KitchenStatus, KitchenTicket } from '../../core/models/kitchen-ticket.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KitchenService {
  private readonly apiUrl = `${environment.apiUrl}/kitchen`;

  constructor(private readonly http: HttpClient) {}

  active(): Observable<KitchenTicket[]> {
    return this.http.get<KitchenTicket[]>(`${this.apiUrl}/active`);
  }

  updateStatus(id: string, status: KitchenStatus): Observable<KitchenTicket> {
    return this.http.put<KitchenTicket>(`${this.apiUrl}/${id}/status`, { status });
  }
}
