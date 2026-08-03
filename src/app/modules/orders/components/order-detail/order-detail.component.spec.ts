import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PaymentCheckout } from '../../../../core/models/payment.model';
import { RealtimeService } from '../../../../core/services/realtime.service';
import { AuthService } from '../../../auth/auth.service';
import { PaymentsService } from '../../../payments/payments.service';
import { OrdersService } from '../../orders.service';
import { OrderDetailComponent } from './order-detail.component';

describe('OrderDetailComponent', () => {
  const order = {
    id: 'order-1',
    tableId: 'table-1',
    table: { id: 'table-1', number: 4 },
    status: 'IN_PROGRESS',
    total: 20,
    items: [{ name: 'Hamburguesa', quantity: 2, unitPrice: 10, subtotal: 20 }],
  };
  const waitingCheckout: PaymentCheckout = {
    orderId: 'order-1',
    orderStatus: 'IN_PROGRESS',
    kitchenStatus: 'IN_PROGRESS',
    tableNumber: 4,
    total: 20,
    state: 'WAITING_KITCHEN',
    message: 'Espera a que cocina marque la orden como lista',
    canPay: false,
    methods: [],
    cashSession: null,
    payment: null,
  };
  const readyCheckout: PaymentCheckout = {
    ...waitingCheckout,
    orderStatus: 'READY',
    kitchenStatus: 'READY',
    state: 'READY_TO_PAY',
    message: 'Selecciona el método cuando el cliente realice el pago',
    canPay: true,
    methods: ['CASH', 'CARD', 'QR'],
    cashSession: {
      id: 'cash-1',
      openedAt: '2026-08-02T10:00:00.000Z',
      openingBalance: 100,
    },
  };
  const paidCheckout: PaymentCheckout = {
    ...readyCheckout,
    orderStatus: 'COMPLETED',
    state: 'PAID',
    message: 'La orden ya fue cobrada',
    canPay: false,
    methods: [],
    payment: {
      id: 'payment-1',
      method: 'CASH',
      amount: 20,
      receivedAmount: 50,
      changeAmount: 30,
      createdAt: '2026-08-02T12:00:00.000Z',
    },
  };
  const receipt = {
    receiptNumber: 'payment-1',
    issuedAt: '2026-08-02T12:00:00.000Z',
    method: 'CASH' as const,
    amount: 20,
    receivedAmount: 50,
    changeAmount: 30,
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
  let orders: jasmine.SpyObj<OrdersService>;
  let realtimeCallbacks: Record<string, () => void>;

  beforeEach(async () => {
    payments = jasmine.createSpyObj<PaymentsService>('PaymentsService', [
      'checkout',
      'create',
      'receipt',
    ]);
    payments.checkout.and.returnValue(of(waitingCheckout));
    payments.create.and.returnValue(
      of({ id: 'payment-1', orderId: 'order-1', amount: 20, method: 'CASH' }),
    );
    payments.receipt.and.returnValue(of(receipt));
    orders = jasmine.createSpyObj<OrdersService>('OrdersService', ['get', 'update']);
    orders.get.and.returnValue(of(order as any));
    orders.update.and.returnValue(of(order as any));
    realtimeCallbacks = {};

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'order-1' } } },
        },
        { provide: OrdersService, useValue: orders },
        { provide: PaymentsService, useValue: payments },
        { provide: AuthService, useValue: { user: () => ({ role: { name: 'waiter' } }) } },
        {
          provide: RealtimeService,
          useValue: {
            on: (event: string, callback: () => void) => (realtimeCallbacks[event] = callback),
          },
        },
      ],
    }).compileComponents();
  });

  it('loads the guided checkout state for the order', () => {
    const fixture = TestBed.createComponent(OrderDetailComponent);

    fixture.detectChanges();

    expect(payments.checkout).toHaveBeenCalledOnceWith('order-1');
    expect(fixture.componentInstance.checkout).toEqual(waitingCheckout);
    expect(fixture.nativeElement.querySelector('.payment-methods')).toBeNull();
    const summary = fixture.nativeElement.querySelector('.charge-summary').textContent;
    expect(summary).toContain('Hamburguesa');
    expect(summary).toContain('20.00');
  });

  it('shows payment methods only when checkout allows payment', () => {
    payments.checkout.and.returnValue(of(readyCheckout));
    const fixture = TestBed.createComponent(OrderDetailComponent);

    fixture.detectChanges();

    const methods = fixture.nativeElement.querySelectorAll('.payment-methods button');
    expect(Array.from(methods).map((button: any) => button.textContent.trim())).toEqual([
      'Cobrar en efectivo',
      'Cobrar con tarjeta',
      'Cobrar por QR',
    ]);
  });

  it('asks for confirmation and refreshes checkout after card payment', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    payments.checkout.and.returnValue(of(paidCheckout));
    const component = TestBed.createComponent(OrderDetailComponent).componentInstance;
    component.order = order;
    component.checkout = readyCheckout;

    component.pay('CARD');

    expect(window.confirm).toHaveBeenCalled();
    expect(payments.create).toHaveBeenCalledOnceWith('order-1', 'CARD', undefined);
    expect(payments.checkout).toHaveBeenCalledWith('order-1');
    expect(payments.receipt).toHaveBeenCalledWith('order-1');
  });

  it('calculates change and sends received cash', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    payments.checkout.and.returnValue(of(paidCheckout));
    const component = TestBed.createComponent(OrderDetailComponent).componentInstance;
    component.order = order;
    component.checkout = readyCheckout;
    component.selectPaymentMethod('CASH');
    component.cashReceived = 50;

    expect(component.cashChange()).toBe(30);

    component.confirmCashPayment();

    expect(payments.create).toHaveBeenCalledOnceWith('order-1', 'CASH', 50);
  });

  it('blocks cash payment when received amount is insufficient', () => {
    const component = TestBed.createComponent(OrderDetailComponent).componentInstance;
    component.order = order;
    component.checkout = readyCheckout;
    component.selectPaymentMethod('CASH');
    component.cashReceived = 10;

    component.confirmCashPayment();

    expect(payments.create).not.toHaveBeenCalled();
    expect(component.cashError).toContain('igual o mayor');
  });

  it('does not create a payment when confirmation is rejected', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = TestBed.createComponent(OrderDetailComponent).componentInstance;
    component.order = order;
    component.checkout = readyCheckout;

    component.pay('CARD');

    expect(payments.create).not.toHaveBeenCalled();
  });

  it('loads the receipt when checkout reports a paid order', () => {
    orders.get.and.returnValue(of({ ...order, status: 'COMPLETED' } as any));
    payments.checkout.and.returnValue(of(paidCheckout));
    const fixture = TestBed.createComponent(OrderDetailComponent);

    fixture.detectChanges();

    expect(payments.receipt).toHaveBeenCalledOnceWith('order-1');
    expect(fixture.componentInstance.receipt).toEqual(receipt);
  });

  it('refreshes checkout after kitchen realtime updates', () => {
    const fixture = TestBed.createComponent(OrderDetailComponent);
    fixture.detectChanges();
    payments.checkout.calls.reset();

    realtimeCallbacks['kitchen.updated']();

    expect(payments.checkout).toHaveBeenCalledOnceWith('order-1');
  });

  it('shows the backend error when a paid order has no receipt', () => {
    payments.checkout.and.returnValue(of(paidCheckout));
    payments.receipt.and.returnValue(
      throwError(() => ({ error: { message: 'Pago no encontrado' } })),
    );
    const fixture = TestBed.createComponent(OrderDetailComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.receipt).toBeNull();
    expect(fixture.componentInstance.receiptError).toBe('Pago no encontrado');
  });
});
