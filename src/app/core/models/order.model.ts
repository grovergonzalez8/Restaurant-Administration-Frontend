import { OrderItem } from './order-item.model';
import { OrderStatus } from '../enums/order-status.enum';
import { RestaurantTable } from './table.model';

export interface Order {
  id?: string;
  tableId?: number | string;
  table?: RestaurantTable;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}
