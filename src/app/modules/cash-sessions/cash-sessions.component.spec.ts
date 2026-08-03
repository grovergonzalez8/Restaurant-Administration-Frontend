import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { RealtimeService } from '../../core/services/realtime.service';
import { AuthService } from '../auth/auth.service';
import { OrdersService } from '../orders/orders.service';
import { CashSessionsComponent } from './cash-sessions.component';
import { CashSessionsService } from './cash-sessions.service';

describe('CashSessionsComponent', () => {
  const session = {
    id: 'cash-1',
    openedBy: { id: 'user-1', name: 'Ana' },
    openingBalance: 100,
    status: 'OPEN' as const,
    openedAt: '2026-08-02T10:00:00.000Z',
  };
  const summary = {
    sessionId: 'cash-1',
    status: 'OPEN' as const,
    payments: 2,
    byMethod: { CASH: 50, CARD: 20, QR: 10 },
    totalSales: 80,
    expectedCash: 150,
  };
  let service: jasmine.SpyObj<CashSessionsService>;
  let orders: jasmine.SpyObj<OrdersService>;
  let router: Router;
  let contextOrderId: string | null;

  beforeEach(async () => {
    service = jasmine.createSpyObj<CashSessionsService>('CashSessionsService', [
      'current', 'list', 'open', 'summary', 'close',
    ]);
    service.current.and.returnValue(of(null));
    service.list.and.returnValue(of([]));
    service.open.and.returnValue(of(session));
    service.summary.and.returnValue(of(summary));
    service.close.and.returnValue(of({
      ...session,
      status: 'CLOSED',
      expectedBalance: 150,
      closingBalance: 145,
      difference: -5,
      closedAt: '2026-08-02T18:00:00.000Z',
    }));
    orders = jasmine.createSpyObj<OrdersService>('OrdersService', ['get']);
    orders.get.and.returnValue(of({
      id: 'order-1',
      table: { id: 'table-1', number: 4 },
      status: 'READY',
      total: 20,
      items: [{ menuItemId: 'item-1', name: 'Hamburguesa', quantity: 2, unitPrice: 10, subtotal: 20 }],
    } as any));
    contextOrderId = null;

    await TestBed.configureTestingModule({
      imports: [CashSessionsComponent],
      providers: [
        { provide: CashSessionsService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ role: { name: 'waiter' } }) } },
        { provide: RealtimeService, useValue: { on: () => undefined } },
        { provide: OrdersService, useValue: orders },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => contextOrderId } } },
        },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  it('opens a shift and loads its summary', () => {
    const component = TestBed.createComponent(CashSessionsComponent).componentInstance;
    component.openingBalance = 100;

    component.open();

    expect(service.open).toHaveBeenCalledWith(100);
    expect(service.summary).toHaveBeenCalledWith('cash-1');
    expect(component.currentSession).toEqual(session);
    expect(component.summary).toEqual(summary);
  });

  it('closes the current shift and keeps the reconciliation result', () => {
    const component = TestBed.createComponent(CashSessionsComponent).componentInstance;
    component.currentSession = session;
    component.closingBalance = 145;

    component.close();

    expect(service.close).toHaveBeenCalledWith('cash-1', 145);
    expect(component.currentSession).toBeNull();
    expect(component.lastClosed?.difference).toBe(-5);
  });

  it('rejects negative opening balances before calling the API', () => {
    const component = TestBed.createComponent(CashSessionsComponent).componentInstance;
    component.openingBalance = -1;

    component.open();

    expect(service.open).not.toHaveBeenCalled();
    expect(component.error).toContain('saldo inicial válido');
  });

  it('explains the opening balance and shows the pending order summary', () => {
    contextOrderId = 'order-1';
    const fixture = TestBed.createComponent(CashSessionsComponent);

    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(orders.get).toHaveBeenCalledOnceWith('order-1');
    expect(content).toContain('No es el total de la orden');
    expect(content).toContain('Hamburguesa');
    expect(content).toContain('20.00');
  });

  it('returns to the pending order after opening cash', () => {
    contextOrderId = 'order-1';
    const fixture = TestBed.createComponent(CashSessionsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openingBalance = 0;

    fixture.componentInstance.open();

    expect(service.open).toHaveBeenCalledWith(0);
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/orders/order-1');
  });
});
