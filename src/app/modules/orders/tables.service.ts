import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RestaurantTable, TableOverview } from '../../core/models/table.model';

export interface SaveTablePayload {
  number: number;
  capacity: number;
  status: 'FREE' | 'OUT_OF_SERVICE';
}

@Injectable({ providedIn: 'root' })
export class TablesService {
  constructor(private http: HttpClient) {}
  available(): Observable<RestaurantTable[]> { return this.http.get<RestaurantTable[]>(`${environment.apiUrl}/tables/available`); }

  overview(): Observable<TableOverview[]> {
    return this.http.get<TableOverview[]>(`${environment.apiUrl}/tables/overview`);
  }

  create(payload: SaveTablePayload) {
    return this.http.post<RestaurantTable>(`${environment.apiUrl}/tables`, payload);
  }

  update(id: string, payload: SaveTablePayload) {
    return this.http.put<RestaurantTable>(`${environment.apiUrl}/tables/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/tables/${id}`);
  }
}
