import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { KitchenStatus, KitchenTicket } from '../../core/models/kitchen-ticket.model';
import { RealtimeService } from '../../core/services/realtime.service';
import { KitchenService } from './kitchen.service';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen.component.html',
  styleUrl: './kitchen.component.scss',
})
export class KitchenComponent implements OnInit {
  tickets: KitchenTicket[] = [];
  loading = true;
  updatingId: string | null = null;
  error = '';
  success = '';

  constructor(
    private readonly kitchen: KitchenService,
    realtime: RealtimeService,
  ) {
    ['kitchen.created', 'kitchen.updated', 'order.created'].forEach((event) =>
      realtime.on(event, () => this.load()),
    );
  }

  ngOnInit(): void {
    this.load();
  }

  get pending(): KitchenTicket[] {
    return this.tickets.filter((ticket) => ticket.status === 'pending');
  }

  get inProgress(): KitchenTicket[] {
    return this.tickets.filter((ticket) => ticket.status === 'in_progress');
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.kitchen.active().subscribe({
      next: (tickets) => {
        this.tickets = tickets ?? [];
        this.loading = false;
      },
      error: (response) => {
        this.loading = false;
        this.error = this.errorMessage(response, 'No se pudieron cargar las órdenes de cocina.');
      },
    });
  }

  advance(ticket: KitchenTicket): void {
    const nextStatus: KitchenStatus = ticket.status === 'pending' ? 'in_progress' : 'ready';
    this.changeStatus(ticket, nextStatus);
  }

  cancel(ticket: KitchenTicket): void {
    if (!window.confirm('¿Cancelar esta orden de cocina? Se repondrá el inventario consumido.')) return;
    this.changeStatus(ticket, 'cancelled');
  }

  tableLabel(ticket: KitchenTicket): string {
    return ticket.order.table?.number != null
      ? `Mesa ${ticket.order.table.number}`
      : `Mesa ${ticket.order.table?.id ?? 'sin asignar'}`;
  }

  private changeStatus(ticket: KitchenTicket, status: KitchenStatus): void {
    this.updatingId = ticket.id;
    this.error = '';
    this.success = '';
    this.kitchen.updateStatus(ticket.id, status).subscribe({
      next: (updated) => {
        this.updatingId = null;
        if (status === 'ready' || status === 'cancelled') {
          this.tickets = this.tickets.filter((candidate) => candidate.id !== ticket.id);
          this.success = status === 'ready'
            ? `${this.tableLabel(ticket)} lista para entregar y cobrar.`
            : `${this.tableLabel(ticket)} cancelada.`;
          return;
        }
        this.tickets = this.tickets.map((candidate) =>
          candidate.id === updated.id ? updated : candidate,
        );
      },
      error: (response) => {
        this.updatingId = null;
        this.error = this.errorMessage(response, 'No se pudo actualizar la orden de cocina.');
      },
    });
  }

  private errorMessage(response: any, fallback: string): string {
    const message = response?.error?.message;
    return Array.isArray(message) ? message.join(' ') : message || fallback;
  }
}
