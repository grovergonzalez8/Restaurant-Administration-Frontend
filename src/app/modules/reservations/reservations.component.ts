import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Reservation,
  ReservationStatus,
} from '../../core/models/reservation.model';
import { RestaurantTable, tableLabel } from '../../core/models/table.model';
import { ReservationsService } from './reservations.service';
import { AuthService } from '../auth/auth.service';

interface StatusAction {
  status: ReservationStatus;
  label: string;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  tables: RestaurantTable[] = [];
  loading = false;
  checkingAvailability = false;
  saving = false;
  updatingId: string | null = null;
  availabilityChecked = false;
  error = '';
  success = '';
  form = this.emptyForm();

  constructor(
    private readonly service: ReservationsService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  get canManageReservations(): boolean {
    return ['admin', 'host'].includes(this.auth.user()?.role?.name || '');
  }

  get canTakeOrder(): boolean {
    return ['admin', 'waiter'].includes(this.auth.user()?.role?.name || '');
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.upcoming().subscribe({
      next: (reservations) => {
        this.reservations = reservations || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar las reservas.';
      },
    });
  }

  scheduleChanged(): void {
    this.form.tableId = '';
    this.tables = [];
    this.availabilityChecked = false;
    this.success = '';
  }

  checkAvailability(): void {
    const reservationAt = this.reservationDate();
    if (!reservationAt || reservationAt.getTime() <= Date.now()) {
      this.error = 'Selecciona una fecha y hora futuras.';
      return;
    }
    if (this.form.guests < 1) {
      this.error = 'La reserva debe tener al menos un comensal.';
      return;
    }

    this.checkingAvailability = true;
    this.availabilityChecked = false;
    this.error = '';
    this.success = '';
    this.service
      .availability({
        reservationAt: reservationAt.toISOString(),
        guests: this.form.guests,
      })
      .subscribe({
        next: (tables) => {
          this.tables = tables || [];
          this.form.tableId = '';
          this.checkingAvailability = false;
          this.availabilityChecked = true;
        },
        error: (response) => {
          this.tables = [];
          this.checkingAvailability = false;
          this.error = response.error?.message || 'No se pudo consultar la disponibilidad.';
        },
      });
  }

  create(): void {
    const reservationAt = this.reservationDate();
    if (!this.form.customerName.trim() || !this.form.phone.trim()) {
      this.error = 'Completa el nombre y teléfono del cliente.';
      return;
    }
    if (!reservationAt || reservationAt.getTime() <= Date.now()) {
      this.error = 'Selecciona una fecha y hora futuras.';
      return;
    }
    if (!this.availabilityChecked || !this.form.tableId) {
      this.error = 'Consulta la disponibilidad y selecciona una mesa.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    this.service
      .create({
        tableId: this.form.tableId,
        customerName: this.form.customerName.trim(),
        phone: this.form.phone.trim(),
        email: this.form.email.trim() || undefined,
        guests: this.form.guests,
        reservationAt: reservationAt.toISOString(),
        note: this.form.note.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.success = 'Reserva creada correctamente.';
          this.form = this.emptyForm();
          this.tables = [];
          this.availabilityChecked = false;
          this.load();
        },
        error: (response) => {
          this.saving = false;
          this.error = response.error?.message || 'No se pudo crear la reserva.';
        },
      });
  }

  actions(reservation: Reservation): StatusAction[] {
    if (!this.canManageReservations) return [];
    if (reservation.status === 'PENDING') {
      return [
        { status: 'CONFIRMED', label: 'Confirmar' },
        { status: 'CANCELLED', label: 'Cancelar' },
      ];
    }
    if (reservation.status === 'CONFIRMED') {
      return [{ status: 'CANCELLED', label: 'Cancelar' }];
    }
    return [];
  }

  takeOrder(reservation: Reservation): void {
    if (!this.canTakeOrder || reservation.status !== 'CONFIRMED') return;
    void this.router.navigate(['/orders/new'], {
      queryParams: {
        tableId: reservation.table?.id || reservation.tableId,
        reservationId: reservation.id,
        customer: reservation.customerName,
      },
    });
  }

  updateStatus(reservation: Reservation, action: StatusAction): void {
    if (
      action.status === 'CANCELLED' &&
      !window.confirm(`¿Cancelar la reserva de ${reservation.customerName}?`)
    ) {
      return;
    }
    this.updatingId = reservation.id;
    this.error = '';
    this.success = '';
    this.service.status(reservation.id, action.status).subscribe({
      next: () => {
        this.updatingId = null;
        this.success = 'Estado de la reserva actualizado.';
        this.load();
      },
      error: (response) => {
        this.updatingId = null;
        this.error = response.error?.message || 'No se pudo actualizar la reserva.';
      },
    });
  }

  statusLabel(status: ReservationStatus): string {
    return {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Cliente recibido',
    }[status];
  }

  tableName(table?: RestaurantTable): string {
    return tableLabel(table);
  }

  private reservationDate(): Date | null {
    if (!this.form.reservationAt) return null;
    const value = new Date(this.form.reservationAt);
    return Number.isNaN(value.getTime()) ? null : value;
  }

  private emptyForm() {
    return {
      tableId: '',
      customerName: '',
      phone: '',
      email: '',
      guests: 1,
      reservationAt: '',
      note: '',
    };
  }
}
