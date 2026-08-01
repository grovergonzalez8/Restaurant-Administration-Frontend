import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../core/models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  list(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  my(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`);
  }

  get(id: string) {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<Order>) {
    return this.http.post<Order>(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<Order>) {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
