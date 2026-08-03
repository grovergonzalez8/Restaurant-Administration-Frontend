import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrdersService } from '../../orders.service';
import { PaymentsService } from '../../../payments/payments.service';
import {
  PaymentCheckout,
  PaymentMethod,
  PaymentReceipt,
} from '../../../../core/models/payment.model';
import { AuthService } from '../../../auth/auth.service';
import { tableLabel } from '../../../../core/models/table.model';
import { OrderStatus } from '../../../../core/enums/order-status.enum';
import { RealtimeService } from '../../../../core/services/realtime.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIf],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  readonly statuses = [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED];
  error = '';
  paying = false;
  checkout: PaymentCheckout | null = null;
  loadingCheckout = false;
  checkoutError = '';
  receipt: PaymentReceipt | null = null;
  loadingReceipt = false;
  receiptError = '';
  selectedPaymentMethod: PaymentMethod | null = null;
  cashReceived: number | null = null;
  cashError = '';
  readonly tableLabel = tableLabel;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private payments: PaymentsService,
    private auth: AuthService,
    realtime: RealtimeService,
  ) {
    ['order.updated', 'kitchen.updated', 'payment.created'].forEach((event) =>
      realtime.on(event, () => this.loadCheckout()),
    );
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ordersService.get(id).subscribe((order) => {
      this.order = order;
      if (!this.canCollectPayment()) return;
      this.loadCheckout();
    });
  }

  updateStatus(status: OrderStatus): void {
    this.ordersService.update(this.order.id, { status }).subscribe({ next: (order) => this.order = order, error: (response) => this.error = response.error?.message || 'No se pudo actualizar la orden.' });
  }

  selectPaymentMethod(method: PaymentMethod): void {
    if (method === 'CASH') {
      this.selectedPaymentMethod = method;
      this.cashReceived = null;
      this.cashError = '';
      return;
    }
    this.resetCashPayment();
    this.pay(method);
  }

  confirmCashPayment(): void {
    if (!this.canConfirmCash()) {
      this.cashError = 'Ingresa un monto igual o mayor al total de la orden.';
      return;
    }
    this.cashError = '';
    this.pay('CASH', Number(this.cashReceived));
  }

  canConfirmCash(): boolean {
    if (this.cashReceived == null || !this.checkout) return false;
    return Number.isFinite(Number(this.cashReceived)) && Number(this.cashReceived) >= this.checkout.total;
  }

  cashChange(): number {
    if (!this.canConfirmCash() || !this.checkout) return 0;
    return Math.round((Number(this.cashReceived) - this.checkout.total) * 100) / 100;
  }

  resetCashPayment(): void {
    this.selectedPaymentMethod = null;
    this.cashReceived = null;
    this.cashError = '';
  }

  pay(method: PaymentMethod, receivedAmount?: number): void {
    if (!this.checkout?.canPay || !this.checkout.methods.includes(method)) return;
    const methodLabel = this.paymentMethodLabel(method);
    const total = Number(this.checkout.total).toFixed(2);
    const cashDetail = method === 'CASH'
      ? ` El cliente entrega $${Number(receivedAmount).toFixed(2)} y debes devolver $${this.cashChange().toFixed(2)}.`
      : '';
    if (!window.confirm(`¿Confirmar el cobro de $${total} mediante ${methodLabel}?${cashDetail}`)) return;

    this.paying = true;
    this.error = '';
    this.payments.create(this.order.id, method, receivedAmount).subscribe({
      next: () => {
        this.order = { ...this.order, status: OrderStatus.COMPLETED };
        this.paying = false;
        this.resetCashPayment();
        this.loadCheckout();
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

  statusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.IN_PROGRESS]: 'En preparación',
      [OrderStatus.READY]: 'Lista para cobrar',
      [OrderStatus.COMPLETED]: 'Completada',
      [OrderStatus.CANCELLED]: 'Cancelada',
    };
    return labels[status];
  }

  retryReceipt(): void {
    if (this.order?.id) this.loadReceipt(this.order.id);
  }

  retryCheckout(): void {
    this.loadCheckout();
  }

  paymentMethodLabel(method: PaymentMethod): string {
    return method === 'CASH' ? 'Efectivo' : method === 'CARD' ? 'Tarjeta' : 'QR';
  }

  paymentActionLabel(method: PaymentMethod): string {
    return method === 'CASH'
      ? 'Cobrar en efectivo'
      : method === 'CARD'
        ? 'Cobrar con tarjeta'
        : 'Cobrar por QR';
  }

  private loadCheckout(): void {
    if (!this.order?.id || !this.canCollectPayment()) return;
    this.loadingCheckout = true;
    this.checkoutError = '';
    this.payments.checkout(this.order.id).subscribe({
      next: (checkout) => {
        this.checkout = checkout;
        this.order = {
          ...this.order,
          status: checkout.orderStatus,
          total: checkout.total,
        };
        this.loadingCheckout = false;
        if (!checkout.canPay) this.resetCashPayment();
        if (checkout.state === 'PAID' && !this.loadingReceipt && !this.receipt) {
          this.loadReceipt(this.order.id);
        }
      },
      error: (response) => {
        this.checkout = null;
        this.loadingCheckout = false;
        this.checkoutError = response.error?.message || 'No se pudo consultar el estado del cobro.';
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
