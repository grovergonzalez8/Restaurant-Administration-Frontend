import { PaymentMethod } from './payment.model';

export type CashSessionStatus = 'OPEN' | 'CLOSED';

export interface CashSessionUser {
  id: string;
  name: string;
  email?: string;
}

export interface CashSession {
  id: string;
  openedBy: CashSessionUser;
  openingBalance: number;
  expectedBalance?: number;
  closingBalance?: number;
  difference?: number;
  status: CashSessionStatus;
  openedAt: string;
  closedAt?: string;
}

export interface CashSessionSummary {
  sessionId: string;
  status: CashSessionStatus;
  payments: number;
  byMethod: Record<PaymentMethod, number>;
  totalSales: number;
  expectedCash: number;
}
