import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
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
  let payments: jasmine.SpyObj<PaymentsService>;
  let cashSessions: jasmine.SpyObj<CashSessionsService>;

  beforeEach(async () => {
    payments = jasmine.createSpyObj<PaymentsService>('PaymentsService', ['create']);
    payments.create.and.returnValue(of({ id: 'payment-1', orderId: 'order-1', amount: 20, method: 'CASH' }));
    cashSessions = jasmine.createSpyObj<CashSessionsService>('CashSessionsService', ['current']);
    cashSessions.current.and.returnValue(of(cashSession));

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
        { provide: OrdersService, useValue: { get: () => of(order), update: () => of(order) } },
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
  });

  it('blocks payment when there is no open cash session', () => {
    const component = TestBed.createComponent(OrderDetailComponent).componentInstance;
    component.order = order;

    component.pay('CARD');

    expect(payments.create).not.toHaveBeenCalled();
    expect(component.error).toContain('abrir una caja');
  });
});
