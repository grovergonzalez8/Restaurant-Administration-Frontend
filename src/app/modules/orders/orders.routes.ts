import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderCreateComponent } from './components/order-create/order-create.component';

export const ordersRoutes = [
  { path: 'orders', component: OrdersListComponent },
  { path: 'orders/new', component: OrderCreateComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
];
