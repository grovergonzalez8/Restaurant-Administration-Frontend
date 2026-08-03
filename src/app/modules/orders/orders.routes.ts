import { Routes } from '@angular/router';
import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderCreateComponent } from './components/order-create/order-create.component';

export const ordersRoutes: Routes = [
  {
    path: 'orders',
    component: OrdersListComponent,
    data: { roles: ['admin', 'kitchen', 'waiter'] },
  },
  {
    path: 'orders/new',
    component: OrderCreateComponent,
    data: { roles: ['admin', 'waiter'] },
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent,
    data: { roles: ['admin', 'kitchen', 'waiter'] },
  },
];
