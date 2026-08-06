import { PaymentMethod } from './payment.model';
export interface SalesReport { payments: number; total: number; byMethod: Record<PaymentMethod, number>; }
export interface TopProduct { name: string; quantity: number; sales: number; }
export interface InventoryMovementItem {
  name: string;
  unit: string;
  entries: number;
  outputs: number;
  net: number;
}
export interface InventoryReport {
  movements: { entries: number; outputs: number };
  items: InventoryMovementItem[];
}
