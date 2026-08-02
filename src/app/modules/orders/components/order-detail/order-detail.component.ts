import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrdersService } from '../../orders.service';
import { PaymentsService } from '../../../payments/payments.service';
import { PaymentMethod } from '../../../../core/models/payment.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  readonly statuses = [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED, OrderStatus.CANCELLED];
  error = '';
  paying = false;

  constructor(private route: ActivatedRoute, private ordersService: OrdersService, private payments: PaymentsService, private auth: AuthService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ordersService.get(id).subscribe((o) => (this.order = o));
  }

  updateStatus(status: OrderStatus): void {
    this.ordersService.update(this.order.id, { status }).subscribe({ next: (order) => this.order = order, error: (response) => this.error = response.error?.message || 'No se pudo actualizar la orden.' });
  }

  pay(method: PaymentMethod): void {
    this.paying = true;
    this.payments.create(this.order.id, method).subscribe({ next: () => { this.order = { ...this.order, status: OrderStatus.COMPLETED }; this.paying = false; }, error: (response) => { this.paying = false; this.error = response.error?.message || 'No se pudo procesar el pago.'; } });
  }

  canUpdateStatus(): boolean {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    return role === 'admin' || role === 'kitchen' || role === 'cocina';
  }
}
import { OrderStatus } from '../../../../core/enums/order-status.enum';
