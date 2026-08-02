export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export interface Reservation { id: string; tableId: string; customerName: string; phone: string; email?: string; guests: number; reservationAt: string; note?: string; status: ReservationStatus; table?: { id: string; number?: number }; }
