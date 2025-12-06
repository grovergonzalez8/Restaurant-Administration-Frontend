import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';

@NgModule({
  imports: [CommonModule, RouterModule, OrdersListComponent, OrderDetailComponent],
})
export class OrdersModule {}
