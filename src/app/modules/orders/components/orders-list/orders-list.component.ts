import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersService } from '../../orders.service';
import { AuthService } from '../../../auth/auth.service';
import { RealtimeService } from '../../../../core/services/realtime.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent implements OnInit {
  orders: any[] = [];

  constructor(private ordersService: OrdersService, private auth: AuthService, realtime: RealtimeService) {
    ['order.created', 'order.updated', 'order.deleted'].forEach((event) => realtime.on(event, () => this.load()));
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    const source = role === 'admin' || role === 'kitchen' || role === 'cocina' ? this.ordersService.list() : this.ordersService.my();
    source.subscribe((res) => (this.orders = res || []));
  }
}
