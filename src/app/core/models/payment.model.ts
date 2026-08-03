export type PaymentMethod = 'CASH' | 'CARD' | 'QR';
export type PaymentCheckoutState =
  | 'WAITING_KITCHEN'
  | 'OPEN_CASH_SESSION'
  | 'READY_TO_PAY'
  | 'PAID'
  | 'CANCELLED';

export interface Payment {
  id: string;
  orderId?: string;
  order?: { id: string };
  amount: number;
  method: PaymentMethod;
  createdAt?: string;
}

export interface PaymentCheckout {
  orderId: string;
  orderStatus: string;
  kitchenStatus: string | null;
  tableNumber: number;
  total: number;
  state: PaymentCheckoutState;
  message: string;
  canPay: boolean;
  methods: PaymentMethod[];
  cashSession: {
    id: string;
    openedAt: string;
    openingBalance: number;
  } | null;
  payment: {
    id: string;
    method: PaymentMethod;
    amount: number;
    createdAt: string;
  } | null;
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
