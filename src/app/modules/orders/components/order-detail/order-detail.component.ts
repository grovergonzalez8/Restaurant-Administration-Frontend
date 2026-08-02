import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrdersService } from '../../orders.service';
import { PaymentsService } from '../../../payments/payments.service';
import { PaymentMethod } from '../../../../core/models/payment.model';
import { AuthService } from '../../../auth/auth.service';
import { CashSession } from '../../../../core/models/cash-session.model';
import { CashSessionsService } from '../../../cash-sessions/cash-sessions.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  readonly statuses = [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED];
  error = '';
  paying = false;
  cashSession: CashSession | null = null;
  checkingCash = false;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private payments: PaymentsService,
    private auth: AuthService,
    private cashSessions: CashSessionsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ordersService.get(id).subscribe((o) => (this.order = o));
    if (this.canCollectPayment()) this.loadCashSession();
  }

  updateStatus(status: OrderStatus): void {
    this.ordersService.update(this.order.id, { status }).subscribe({ next: (order) => this.order = order, error: (response) => this.error = response.error?.message || 'No se pudo actualizar la orden.' });
  }

  pay(method: PaymentMethod): void {
    if (!this.cashSession) {
      this.error = 'Debes abrir una caja antes de registrar pagos.';
      return;
    }
    this.paying = true;
    this.error = '';
    this.payments.create(this.order.id, method).subscribe({ next: () => { this.order = { ...this.order, status: OrderStatus.COMPLETED }; this.paying = false; }, error: (response) => { this.paying = false; this.error = response.error?.message || 'No se pudo procesar el pago.'; } });
  }

  canUpdateStatus(): boolean {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    return role === 'admin';
  }

  canCollectPayment(): boolean {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    return role === 'admin' || role === 'waiter' || role === 'mesero';
  }

  private loadCashSession(): void {
    this.checkingCash = true;
    this.cashSessions.current().subscribe({
      next: (session) => {
        this.cashSession = session;
        this.checkingCash = false;
      },
      error: () => {
        this.cashSession = null;
        this.checkingCash = false;
      },
    });
  }
}
import { OrderStatus } from '../../../../core/enums/order-status.enum';
