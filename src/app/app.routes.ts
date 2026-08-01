import { Routes } from '@angular/router';
import { authRoutes } from './modules/auth/auth.routes';
import { ordersRoutes } from './modules/orders/orders.routes';
import { menuRoutes } from './modules/menu/menu.routes';
import { authGuard } from './modules/auth/auth.guard';
import { DashboardComponent } from './modules/dashboard/dashboard.component';

export const routes: Routes = [
    ...authRoutes,
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    ...ordersRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
    ...menuRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
    { path: '', redirectTo: 'menu', pathMatch: 'full' },
    { path: '**', redirectTo: 'menu' },
];
