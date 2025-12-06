import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  public user = signal<any>(null);

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
        }
      })
    );
  }
  
  logout() {
    this.user.set(null);
    localStorage.removeItem('token');
  }
}
