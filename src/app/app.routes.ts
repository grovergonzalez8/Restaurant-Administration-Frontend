import { Routes } from '@angular/router';
import { authRoutes } from './modules/auth/auth.routes';
import { ordersRoutes } from './modules/orders/orders.routes';
import { menuRoutes } from './modules/menu/menu.routes';

export const routes: Routes = [
    ...authRoutes,
    ...ordersRoutes,
    ...menuRoutes,
    { path: '', redirectTo: 'menu', pathMatch: 'full' },
    { path: '**', redirectTo: 'menu' },
];
