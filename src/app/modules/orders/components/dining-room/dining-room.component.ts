import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableOverview } from '../../../../core/models/table.model';
import {
  reservationTiming as getReservationTiming,
  reservationTimingLabel as getReservationTimingLabel,
} from '../../../../core/models/reservation.model';
import { RealtimeService } from '../../../../core/services/realtime.service';
import { AuthService } from '../../../auth/auth.service';
import { normalizeRole } from '../../../auth/role-access';
import { TablesService } from '../../tables.service';

@Component({
  selector: 'app-dining-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dining-room.component.html',
  styleUrl: './dining-room.component.scss',
})
export class DiningRoomComponent implements OnInit {
  readonly reservationTiming = getReservationTiming;
  readonly reservationTimingLabel = getReservationTimingLabel;
  tables: TableOverview[] = [];
  loading = true;
  saving = false;
  editingId: string | null = null;
  error = '';
  success = '';
  form = this.emptyForm();

  constructor(
    private readonly tablesService: TablesService,
    private readonly auth: AuthService,
    realtime: RealtimeService,
  ) {
    [
      'order.created',
      'order.updated',
      'order.deleted',
      'table.created',
      'table.updated',
      'table.deleted',
      'reservation.created',
      'reservation.updated',
      'reservation.deleted',
    ].forEach((event) =>
      realtime.on(event, () => this.load()),
    );
  }

  get isAdmin(): boolean {
    return normalizeRole(this.auth.user()?.role?.name) === 'admin';
  }

  get freeCount(): number {
    return this.tables.filter((table) => table.status === 'FREE').length;
  }

  get occupiedCount(): number {
    return this.tables.filter((table) => table.status === 'OCCUPIED').length;
  }

  get reservationCount(): number {
    return this.tables.filter((table) => table.nextReservation).length;
  }

  get editingTable(): TableOverview | null {
    return this.tables.find((table) => table.id === this.editingId) || null;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.tablesService.overview().subscribe({
      next: (tables) => {
        this.tables = tables || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar el estado del salón.';
      },
    });
  }

  canCreateOrder(table: TableOverview): boolean {
    const role = normalizeRole(this.auth.user()?.role?.name);
    return table.status === 'FREE' && (role === 'admin' || role === 'waiter');
  }

  canOpenOrder(table: TableOverview): boolean {
    if (!table.activeOrder) return false;
    const user = this.auth.user();
    const role = normalizeRole(user?.role?.name);
    return role === 'admin' || (role === 'waiter' && table.activeOrder.waiter?.id === user?.id);
  }

  canEditTable(table: TableOverview): boolean {
    return this.isAdmin && table.status !== 'OCCUPIED' && !table.activeOrder;
  }

  edit(table: TableOverview): void {
    if (!this.canEditTable(table)) return;
    this.editingId = table.id;
    this.form = {
      number: table.number || 1,
      capacity: table.capacity,
      status: table.status === 'OUT_OF_SERVICE' ? 'OUT_OF_SERVICE' : 'FREE',
    };
    this.error = '';
    this.success = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  saveTable(): void {
    if (!this.isAdmin) return;
    if (!Number.isInteger(this.form.number) || this.form.number < 1) {
      this.error = 'El número de mesa debe ser un entero positivo.';
      return;
    }
    if (!Number.isInteger(this.form.capacity) || this.form.capacity < 1) {
      this.error = 'La capacidad debe ser un entero positivo.';
      return;
    }
    const reservation = this.editingTable?.nextReservation;
    if (reservation && this.form.status === 'OUT_OF_SERVICE') {
      this.error = 'La mesa debe permanecer disponible para su próxima reserva.';
      return;
    }
    if (reservation && this.form.capacity < reservation.guests) {
      this.error = `La capacidad mínima es de ${reservation.guests} lugares por la próxima reserva.`;
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    const request = this.editingId
      ? this.tablesService.update(this.editingId, this.form)
      : this.tablesService.create(this.form);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.success = this.editingId ? 'Mesa actualizada.' : 'Mesa creada.';
        this.cancelEdit();
        this.load();
      },
      error: (response) => {
        this.saving = false;
        this.error = response.error?.message || 'No se pudo guardar la mesa.';
      },
    });
  }

  removeTable(table: TableOverview): void {
    if (!this.canEditTable(table)) return;
    if (!window.confirm(`¿Eliminar la mesa ${table.number}?`)) return;
    this.error = '';
    this.success = '';
    this.tablesService.remove(table.id).subscribe({
      next: () => {
        this.success = 'Mesa eliminada.';
        this.load();
      },
      error: (response) => {
        this.error = response.error?.message || 'No se pudo eliminar la mesa.';
      },
    });
  }

  tableStatus(table: TableOverview): string {
    if (table.activeOrder?.status === 'READY') return 'Lista para cobrar';
    if (table.activeOrder?.status === 'IN_PROGRESS') return 'En preparación';
    if (table.activeOrder?.status === 'PENDING') return 'Pedido pendiente';
    return {
      FREE: 'Libre',
      OCCUPIED: 'Ocupada',
      RESERVED: 'Reservada',
      OUT_OF_SERVICE: 'Fuera de servicio',
    }[table.status];
  }

  private emptyForm(): {
    number: number;
    capacity: number;
    status: 'FREE' | 'OUT_OF_SERVICE';
  } {
    return { number: 1, capacity: 4, status: 'FREE' };
  }
}
