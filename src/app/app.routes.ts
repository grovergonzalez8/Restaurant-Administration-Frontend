import { Routes } from '@angular/router';
import { authRoutes } from './modules/auth/auth.routes';
import { ordersRoutes } from './modules/orders/orders.routes';
import { menuRoutes } from './modules/menu/menu.routes';
import { authGuard } from './modules/auth/auth.guard';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { InventoryComponent } from './modules/inventory/inventory.component';
import { ReservationsComponent } from './modules/reservations/reservations.component';
import { RecipesComponent } from './modules/recipes/recipes.component';
import { ReportsComponent } from './modules/reports/reports.component';
import { CashSessionsComponent } from './modules/cash-sessions/cash-sessions.component';

export const routes: Routes = [
    ...authRoutes,
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
    { path: 'reservations', component: ReservationsComponent, canActivate: [authGuard] },
    { path: 'recipes', component: RecipesComponent, canActivate: [authGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
    { path: 'cash', component: CashSessionsComponent, canActivate: [authGuard] },
    ...ordersRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
    ...menuRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
    { path: '', redirectTo: 'menu', pathMatch: 'full' },
    { path: '**', redirectTo: 'menu' },
];
