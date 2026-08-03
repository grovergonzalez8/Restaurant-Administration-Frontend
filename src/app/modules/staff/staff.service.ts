import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role } from '../../core/models/role.model';
import { User } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

export interface CreateStaffPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  roleId: number;
}

export interface UpdateStaffPayload {
  name: string;
  email: string;
  phone?: string;
  roleId: number;
  password?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  constructor(private readonly http: HttpClient) {}

  users() {
    return this.http.get<User[]>(this.usersUrl);
  }

  roles() {
    return this.http.get<Role[]>(this.rolesUrl);
  }

  create(payload: CreateStaffPayload) {
    return this.http.post<User>(this.usersUrl, payload);
  }

  update(id: string, payload: UpdateStaffPayload) {
    return this.http.put<User>(`${this.usersUrl}/${id}`, payload);
  }

  setActive(id: string, isActive: boolean) {
    return this.http.put<User>(`${this.usersUrl}/${id}`, { isActive });
  }
}
