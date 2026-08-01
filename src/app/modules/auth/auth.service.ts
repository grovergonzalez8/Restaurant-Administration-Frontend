import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  public user = signal<User | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        // backend may return token in several shapes (accessToken, token, access_token)
        const token = res?.accessToken || res?.token || res?.access_token || res?.data?.accessToken;
        const user = res?.user || res?.data?.user;

        if (token) {
          localStorage.setItem('token', token);
        }

        if (user) {
          this.user.set(user);
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }
  
  logout() {
    this.user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('token'));
  }

  private readStoredUser(): User | null {
    try {
      const rawUser = localStorage.getItem('user');
      return rawUser ? JSON.parse(rawUser) as User : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }
}
