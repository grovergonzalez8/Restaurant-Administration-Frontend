import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the receipt associated with an order', () => {
    service.receipt('order-1').subscribe();

    const request = http.expectOne(`${environment.apiUrl}/payments/order/order-1/receipt`);
    expect(request.request.method).toBe('GET');
    request.flush({ receiptNumber: 'payment-1' });
  });

  it('creates a payment with its selected method', () => {
    service.create('order-1', 'CARD').subscribe();

    const request = http.expectOne(`${environment.apiUrl}/payments`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ orderId: 'order-1', method: 'CARD' });
    request.flush({ id: 'payment-1' });
  });

  it('loads the guided checkout state for an order', () => {
    service.checkout('order-1').subscribe();

    const request = http.expectOne(`${environment.apiUrl}/payments/order/order-1/checkout`);
    expect(request.request.method).toBe('GET');
    request.flush({ state: 'READY_TO_PAY', canPay: true, methods: ['CASH', 'CARD', 'QR'] });
  });
});
