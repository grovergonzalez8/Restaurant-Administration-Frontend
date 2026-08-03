import { OrderStatus } from '../enums/order-status.enum';

export type KitchenStatus = 'pending' | 'in_progress' | 'ready' | 'cancelled';

export interface KitchenTicketItem {
  id: string;
  menuItem: { id: string; name: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface KitchenTicket {
  id: string;
  status: KitchenStatus;
  order: {
    id: string;
    status: OrderStatus;
    table: { id: string; number?: number };
    items: KitchenTicketItem[];
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}
