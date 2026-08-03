export type PaymentMethod = 'CASH' | 'CARD' | 'QR';
export interface Payment {
  id: string;
  orderId?: string;
  order?: { id: string };
  amount: number;
  method: PaymentMethod;
  createdAt?: string;
}

export interface PaymentReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentReceipt {
  receiptNumber: string;
  issuedAt: string;
  method: PaymentMethod;
  amount: number;
  cashSessionId: string | null;
  order: {
    id: string;
    createdAt: string;
    tableNumber: number;
    total: number;
    items: PaymentReceiptItem[];
  };
}
