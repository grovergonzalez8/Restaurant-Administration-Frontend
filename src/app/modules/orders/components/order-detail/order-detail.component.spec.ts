import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { CashSessionsService } from '../../../cash-sessions/cash-sessions.service';
import { PaymentsService } from '../../../payments/payments.service';
import { OrdersService } from '../../orders.service';
import { OrderDetailComponent } from './order-detail.component';

describe('OrderDetailComponent', () => {
  const order = { id: 'order-1', tableId: 'table-1', status: 'IN_PROGRESS', total: 20, items: [] };
  const cashSession = {
    id: 'cash-1',
    openedBy: { id: 'user-1', name: 'Ana' },
    openingBalance: 100,
    status: 'OPEN' as const,
    openedAt: '2026-08-02T10:00:00.000Z',
  };
  const receipt = {
    receiptNumber: 'payment-1',
    issuedAt: '2026-08-02T12:00:00.000Z',
    method: 'CASH' as const,
    amount: 20,
    cashSessionId: 'cash-1',
    order: {
      id: 'order-1',
      createdAt: '2026-08-02T11:00:00.000Z',
      tableNumber: 4,
      total: 20,
      items: [],
    },
  };
  let payments: jasmine.SpyObj<PaymentsService>;
  let cashSessions: jasmine.SpyObj<CashSessionsService>;
  let orders: jasmine.SpyObj<OrdersService>;

  beforeEach(async () => {
    payments = jasmine.createSpyObj<PaymentsService>('PaymentsService', ['create', 'receipt']);
    payments.create.and.returnValue(of({ id: 'payment-1', orderId: 'order-1', amount: 20, method: 'CASH' }));
    payments.receipt.and.returnValue(of(receipt));
    cashSessions = jasmine.createSpyObj<CashSessionsService>('CashSessionsService', ['current']);
    cashSessions.current.and.returnValue(of(cashSession));
    orders = jasmine.createSpyObj<OrdersService>('OrdersService', ['get', 'update']);
    orders.get.and.returnValue(of(order as any));
    orders.update.and.returnValue(of(order as any));

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
        { provide: OrdersService, useValue: orders },
        { provide: PaymentsService, useValue: payments },
        { provide: CashSessionsService, useValue: cashSessions },
        { provide: AuthService, useValue: { user: () => ({ role: { name: 'waiter' } }) } },
      ],
    }).compileComponents();
  });

  it('loads the current cash session for a waiter', () => {
    const fixture = TestBed.createComponent(OrderDetailComponent);
    fixture.detectChanges();

    expect(cashSessions.current).toHaveBeenCalled();
    expect(fixture.componentInstance.cashSession).toEqual(cashSession);
  });

  it('registers a payment only with an open cash session', () => {
    const component = TestBed.createComponent(OrderDetailComponent).componentInstance;
    component.order = order;
    component.cashSession = cashSession;

    component.pay('CASH');

    expect(payments.create).toHaveBeenCalledWith('order-1', 'CASH');
    expect(component.order.status).toBe('COMPLETED');
    expect(payments.receipt).toHaveBeenCalledWith('order-1');
    expect(component.receipt).toEqual(receipt);
  });

  it('loads the receipt when reopening a completed order', () => {
    orders.get.and.returnValue(of({ ...order, status: 'COMPLETED' } as any));
    const fixture = TestBed.createComponent(OrderDetailComponent);

    fixture.detectChanges();

    expect(payments.receipt).toHaveBeenCalledWith('order-1');
    expect(fixture.componentInstance.receipt).toEqual(receipt);
    expect(cashSessions.current).not.toHaveBeenCalled();
  });

  it('shows the backend error when a completed order has no receipt', () => {
    orders.get.and.returnValue(of({ ...order, status: 'COMPLETED' } as any));
    payments.receipt.and.returnValue(throwError(() => ({ error: { message: 'Pago no encontrado' } })));
    const fixture = TestBed.createComponent(OrderDetailComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.receipt).toBeNull();
    expect(fixture.componentInstance.receiptError).toBe('Pago no encontrado');
  });

  it('blocks payment when there is no open cash session', () => {
    const component = TestBed.createComponent(OrderDetailComponent).componentInstance;
    component.order = order;

    component.pay('CARD');

    expect(payments.create).not.toHaveBeenCalled();
    expect(component.error).toContain('abrir una caja');
  });
});
