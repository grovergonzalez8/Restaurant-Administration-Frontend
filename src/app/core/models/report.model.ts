import { PaymentMethod } from './payment.model';
export interface SalesReport { payments: number; total: number; byMethod: Record<PaymentMethod, number>; }
export interface TopProduct { name: string; quantity: number; sales: number; }
export interface InventoryReport { entries: number; outputs: number; movements: { entries: number; outputs: number }; }
