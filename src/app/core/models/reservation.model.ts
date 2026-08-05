export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type ReservationTiming = 'OVERDUE' | 'DUE_SOON' | 'SCHEDULED';
export interface Reservation { id: string; tableId: string; customerName: string; phone: string; email?: string; guests: number; reservationAt: string; note?: string; status: ReservationStatus; table?: { id: string; number?: number }; }

export function reservationTiming(
  reservationAt: string,
  now = Date.now(),
): ReservationTiming {
  const scheduledAt = new Date(reservationAt).getTime();
  if (scheduledAt <= now) return 'OVERDUE';
  if (scheduledAt <= now + 60 * 60 * 1000) return 'DUE_SOON';
  return 'SCHEDULED';
}

export function reservationTimingLabel(timing: ReservationTiming): string {
  return {
    OVERDUE: 'Requiere atención',
    DUE_SOON: 'En la próxima hora',
    SCHEDULED: 'Programada',
  }[timing];
}
