import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  public user = signal<any>(null);

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/login`, credentials)
      .pipe(tap((res: any) => this.user.set(res.user)));
  }
  
  logout() {
    this.user.set(null);
    localStorage.removeItem('token');
  }
}
