import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Payment, PaymentMethod } from '../../core/models/payment.model';
@Injectable({ providedIn: 'root' })
export class PaymentsService { constructor(private http: HttpClient) {} create(orderId: string, method: PaymentMethod) { return this.http.post<Payment>(`${environment.apiUrl}/payments`, { orderId, method }); } list() { return this.http.get<Payment[]>(`${environment.apiUrl}/payments`); } }
