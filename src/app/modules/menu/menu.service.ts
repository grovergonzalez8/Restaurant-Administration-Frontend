import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem } from '../../core/models/menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menu`;

  constructor(private http: HttpClient) {}

  list(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  get(id: string) {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<MenuItem>) {
    return this.http.post<MenuItem>(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<MenuItem>) {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
