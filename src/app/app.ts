import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './modules/auth/auth.service';
import { defaultRouteForRole, normalizeRole, StaffRole } from './modules/auth/role-access';

@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  homeRoute(): string {
    return defaultRouteForRole(this.auth.user()?.role?.name);
  }

  private hasRole(...roles: StaffRole[]): boolean {
    const role = normalizeRole(this.auth.user()?.role?.name);
    return role ? roles.includes(role) : false;
  }

  canViewDashboard(): boolean {
    return this.hasRole('admin', 'kitchen');
  }

  canViewKitchenResources(): boolean {
    return this.hasRole('admin', 'kitchen');
  }

  canViewReservations(): boolean {
    return this.hasRole('admin', 'host', 'waiter');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  canManageCash(): boolean {
    return this.hasRole('admin', 'waiter');
  }

  canManageKitchen(): boolean {
    return this.hasRole('admin', 'kitchen');
  }

  canViewOrders(): boolean {
    return this.hasRole('admin', 'kitchen', 'waiter');
  }
}
