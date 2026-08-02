import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CashSession, CashSessionSummary } from '../../core/models/cash-session.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CashSessionsService {
  private readonly apiUrl = `${environment.apiUrl}/cash-sessions`;

  constructor(private readonly http: HttpClient) {}

  current(): Observable<CashSession | null> {
    return this.http.get<CashSession | null>(`${this.apiUrl}/current`);
  }

  list(): Observable<CashSession[]> {
    return this.http.get<CashSession[]>(this.apiUrl);
  }

  open(openingBalance: number): Observable<CashSession> {
    return this.http.post<CashSession>(`${this.apiUrl}/open`, { openingBalance });
  }

  summary(id: string): Observable<CashSessionSummary> {
    return this.http.get<CashSessionSummary>(`${this.apiUrl}/${id}/summary`);
  }

  close(id: string, closingBalance: number): Observable<CashSession> {
    return this.http.post<CashSession>(`${this.apiUrl}/${id}/close`, { closingBalance });
  }
}
