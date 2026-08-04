export interface RestaurantTable {
  id: string;
  number?: number;
  name?: string;
  capacity?: number;
  status?: TableStatus;
}

export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';

export interface TableOverview extends RestaurantTable {
  capacity: number;
  status: TableStatus;
  activeOrder: {
    id: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'READY';
    total: number;
    createdAt: string;
    waiter: { id: string; name: string } | null;
  } | null;
  nextReservation: {
    id: string;
    customerName: string;
    guests: number;
    reservationAt: string;
    status: 'PENDING' | 'CONFIRMED';
  } | null;
}

export function tableLabel(table?: RestaurantTable | null): string {
  const name = table?.name?.trim();
  if (name) return name;
  if (table?.number != null) return `Mesa ${table.number}`;
  return 'Mesa sin número';
}
