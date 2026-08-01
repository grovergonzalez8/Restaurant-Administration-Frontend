import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../../core/models/dashboard-summary.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}
  summary(): Observable<DashboardSummary> { return this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary`); }
}
