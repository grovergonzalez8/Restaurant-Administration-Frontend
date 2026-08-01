export type PaymentMethod = 'CASH' | 'CARD' | 'QR';
export interface Payment { id: string; orderId: string; amount: number; method: PaymentMethod; createdAt?: string; }
