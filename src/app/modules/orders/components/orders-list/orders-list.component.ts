import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersService } from '../../orders.service';
import { AuthService } from '../../../auth/auth.service';
import { RealtimeService } from '../../../../core/services/realtime.service';
import { Order } from '../../../../core/models/order.model';
import { tableLabel } from '../../../../core/models/table.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent implements OnInit {
  orders: Order[] = [];
  readonly tableLabel = tableLabel;
  loading = true;
  error = '';

  constructor(private ordersService: OrdersService, private auth: AuthService, realtime: RealtimeService) {
    ['order.created', 'order.updated', 'order.deleted'].forEach((event) => realtime.on(event, () => this.load()));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const role = this.auth.user()?.role?.name?.toLowerCase();
    const source = role === 'admin' || role === 'kitchen' || role === 'cocina' ? this.ordersService.list() : this.ordersService.my();
    source.subscribe({
      next: (orders) => {
        this.orders = orders ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar las órdenes.';
      },
    });
  }

  statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En preparación',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status];
  }
}
