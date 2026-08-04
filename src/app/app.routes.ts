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
import { KitchenComponent } from './modules/kitchen/kitchen.component';
import { roleGuard } from './modules/auth/role.guard';
import { StaffComponent } from './modules/staff/staff.component';
import { DiningRoomComponent } from './modules/orders/components/dining-room/dining-room.component';

export const routes: Routes = [
    ...authRoutes,
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'kitchen'] } },
    { path: 'inventory', component: InventoryComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'kitchen'] } },
    { path: 'reservations', component: ReservationsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'host', 'waiter'] } },
    { path: 'dining-room', component: DiningRoomComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'host', 'waiter'] } },
    { path: 'recipes', component: RecipesComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'kitchen'] } },
    { path: 'reports', component: ReportsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
    { path: 'staff', component: StaffComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
    { path: 'cash', component: CashSessionsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'waiter'] } },
    { path: 'kitchen', component: KitchenComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'kitchen'] } },
    ...ordersRoutes.map((route) => ({ ...route, canActivate: [authGuard, roleGuard] })),
    ...menuRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
    { path: '', redirectTo: 'menu', pathMatch: 'full' },
    { path: '**', redirectTo: 'menu' },
];
