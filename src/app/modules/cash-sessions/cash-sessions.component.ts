import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CashSession, CashSessionSummary } from '../../core/models/cash-session.model';
import { OrderItem } from '../../core/models/order-item.model';
import { Order } from '../../core/models/order.model';
import { tableLabel } from '../../core/models/table.model';
import { RealtimeService } from '../../core/services/realtime.service';
import { AuthService } from '../auth/auth.service';
import { OrdersService } from '../orders/orders.service';
import { CashSessionsService } from './cash-sessions.service';

@Component({
  selector: 'app-cash-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cash-sessions.component.html',
  styleUrl: './cash-sessions.component.scss',
})
export class CashSessionsComponent implements OnInit {
  currentSession: CashSession | null = null;
  summary: CashSessionSummary | null = null;
  sessions: CashSession[] = [];
  lastClosed: CashSession | null = null;
  openingBalance: number | null = null;
  closingBalance: number | null = null;
  loading = true;
  saving = false;
  error = '';
  checkoutOrder: Order | null = null;
  contextError = '';
  readonly tableLabel = tableLabel;

  constructor(
    private readonly cashSessions: CashSessionsService,
    private readonly auth: AuthService,
    private readonly orders: OrdersService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    realtime: RealtimeService,
  ) {
    realtime.on('payment.created', () => {
      if (this.currentSession) this.loadSummary(this.currentSession.id);
    });
  }

  ngOnInit(): void {
    this.loadCheckoutContext();
    this.load();
  }

  get orderReturnUrl(): string | null {
    return this.checkoutOrder?.id ? `/orders/${this.checkoutOrder.id}` : null;
  }

  get isAdmin(): boolean {
    return this.auth.user()?.role?.name?.toLowerCase() === 'admin';
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.cashSessions.current().subscribe({
      next: (session) => {
        this.currentSession = session;
        this.summary = null;
        if (session) {
          this.loadSummary(session.id);
        } else {
          this.loading = false;
        }
        if (this.isAdmin) this.loadHistory();
      },
      error: (response) => {
        this.loading = false;
        this.error = this.errorMessage(response, 'No se pudo consultar la caja actual.');
      },
    });
  }

  open(): void {
    if (this.openingBalance === null || this.openingBalance < 0) {
      this.error = 'Ingresa un saldo inicial válido.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.cashSessions.open(Number(this.openingBalance)).subscribe({
      next: (session) => {
        this.currentSession = session;
        this.openingBalance = null;
        this.lastClosed = null;
        this.saving = false;
        this.loadSummary(session.id);
        if (this.isAdmin) this.loadHistory();
        if (this.orderReturnUrl) this.router.navigateByUrl(this.orderReturnUrl);
      },
      error: (response) => {
        this.saving = false;
        this.error = this.errorMessage(response, 'No se pudo abrir la caja.');
      },
    });
  }

  itemName(item: OrderItem): string {
    return item.name || (item as OrderItem & { menuItem?: { name?: string } }).menuItem?.name || 'Producto';
  }

  private loadCheckoutContext(): void {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (!orderId) return;

    this.orders.get(orderId).subscribe({
      next: (order) => (this.checkoutOrder = order),
      error: () => {
        this.contextError = 'No se pudo cargar la orden pendiente de cobro.';
      },
    });
  }

  close(): void {
    if (!this.currentSession) return;
    if (this.closingBalance === null || this.closingBalance < 0) {
      this.error = 'Ingresa el efectivo contado para cerrar la caja.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.cashSessions.close(this.currentSession.id, Number(this.closingBalance)).subscribe({
      next: (session) => {
        this.lastClosed = session;
        this.currentSession = null;
        this.summary = null;
        this.closingBalance = null;
        this.saving = false;
        if (this.isAdmin) this.loadHistory();
      },
      error: (response) => {
        this.saving = false;
        this.error = this.errorMessage(response, 'No se pudo cerrar la caja.');
      },
    });
  }

  private loadSummary(id: string): void {
    this.cashSessions.summary(id).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: (response) => {
        this.loading = false;
        this.error = this.errorMessage(response, 'No se pudo cargar el resumen de caja.');
      },
    });
  }

  private loadHistory(): void {
    this.cashSessions.list().subscribe({
      next: (sessions) => (this.sessions = sessions ?? []),
      error: (response) => {
        this.error = this.errorMessage(response, 'No se pudo cargar el historial de cajas.');
      },
    });
  }

  private errorMessage(response: any, fallback: string): string {
    const message = response?.error?.message;
    return Array.isArray(message) ? message.join(' ') : message || fallback;
  }
}
