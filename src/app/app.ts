import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './modules/auth/auth.service';

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

  canViewDashboard(): boolean {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    return role === 'admin' || role === 'kitchen' || role === 'cocina';
  }

  canManageOperations(): boolean {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    return role === 'admin' || role === 'kitchen' || role === 'cocina' || role === 'host';
  }
}
