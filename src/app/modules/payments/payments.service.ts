import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Payment,
  PaymentCheckout,
  PaymentMethod,
  PaymentReceipt,
} from '../../core/models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(private readonly http: HttpClient) {}

  create(orderId: string, method: PaymentMethod) {
    return this.http.post<Payment>(this.apiUrl, { orderId, method });
  }

  checkout(orderId: string) {
    return this.http.get<PaymentCheckout>(`${this.apiUrl}/order/${orderId}/checkout`);
  }

  receipt(orderId: string) {
    return this.http.get<PaymentReceipt>(`${this.apiUrl}/order/${orderId}/receipt`);
  }

  list() {
    return this.http.get<Payment[]>(this.apiUrl);
  }
}
