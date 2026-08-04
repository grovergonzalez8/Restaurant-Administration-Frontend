import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RestaurantTable, TableOverview } from '../../core/models/table.model';

@Injectable({ providedIn: 'root' })
export class TablesService {
  constructor(private http: HttpClient) {}
  available(): Observable<RestaurantTable[]> { return this.http.get<RestaurantTable[]>(`${environment.apiUrl}/tables/available`); }

  overview(): Observable<TableOverview[]> {
    return this.http.get<TableOverview[]>(`${environment.apiUrl}/tables/overview`);
  }
}
