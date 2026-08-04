import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableOverview } from '../../../../core/models/table.model';
import { RealtimeService } from '../../../../core/services/realtime.service';
import { AuthService } from '../../../auth/auth.service';
import { normalizeRole } from '../../../auth/role-access';
import { TablesService } from '../../tables.service';

@Component({
  selector: 'app-dining-room',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dining-room.component.html',
  styleUrl: './dining-room.component.scss',
})
export class DiningRoomComponent implements OnInit {
  tables: TableOverview[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly tablesService: TablesService,
    private readonly auth: AuthService,
    realtime: RealtimeService,
  ) {
    ['order.created', 'order.updated', 'order.deleted'].forEach((event) =>
      realtime.on(event, () => this.load()),
    );
  }

  get freeCount(): number {
    return this.tables.filter((table) => table.status === 'FREE').length;
  }

  get occupiedCount(): number {
    return this.tables.filter((table) => table.status === 'OCCUPIED').length;
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
}
