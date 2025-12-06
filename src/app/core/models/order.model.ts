import { OrderItem } from './order-item.model';
import { OrderStatus } from '../enums/order-status.enum';

export interface Order {
  id?: string;
  tableId: number | string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}
