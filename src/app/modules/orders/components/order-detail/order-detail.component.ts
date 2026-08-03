import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrdersService } from '../../orders.service';
import { PaymentsService } from '../../../payments/payments.service';
import { PaymentMethod, PaymentReceipt } from '../../../../core/models/payment.model';
import { AuthService } from '../../../auth/auth.service';
import { CashSession } from '../../../../core/models/cash-session.model';
import { CashSessionsService } from '../../../cash-sessions/cash-sessions.service';
import { tableLabel } from '../../../../core/models/table.model';

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
  receipt: PaymentReceipt | null = null;
  loadingReceipt = false;
  receiptError = '';
  readonly tableLabel = tableLabel;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private payments: PaymentsService,
    private auth: AuthService,
    private cashSessions: CashSessionsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ordersService.get(id).subscribe((order) => {
      this.order = order;
      if (!this.canCollectPayment()) return;
      if (order.status === OrderStatus.COMPLETED) {
        this.loadReceipt(id);
      } else {
        this.loadCashSession();
      }
    });
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
    this.payments.create(this.order.id, method).subscribe({
      next: () => {
        this.order = { ...this.order, status: OrderStatus.COMPLETED };
        this.paying = false;
        this.loadReceipt(this.order.id);
      },
      error: (response) => {
        this.paying = false;
        this.error = response.error?.message || 'No se pudo procesar el pago.';
      },
    });
  }

  canUpdateStatus(): boolean {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    return role === 'admin';
  }

  canCollectPayment(): boolean {
    const role = this.auth.user()?.role?.name?.toLowerCase();
    return role === 'admin' || role === 'waiter' || role === 'mesero';
  }

  retryReceipt(): void {
    if (this.order?.id) this.loadReceipt(this.order.id);
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

  private loadReceipt(orderId: string): void {
    this.loadingReceipt = true;
    this.receiptError = '';
    this.payments.receipt(orderId).subscribe({
      next: (receipt) => {
        this.receipt = receipt;
        this.loadingReceipt = false;
      },
      error: (response) => {
        this.receipt = null;
        this.loadingReceipt = false;
        this.receiptError = response.error?.message || 'No se pudo cargar el comprobante.';
      },
    });
  }
}
import { OrderStatus } from '../../../../core/enums/order-status.enum';
