import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuService } from '../../../menu/menu.service';
import { MenuItem } from '../../../../core/models/menu-item.model';
import { OrderStatus } from '../../../../core/enums/order-status.enum';
import { OrdersService } from '../../orders.service';
import { TablesService } from '../../tables.service';
import { RestaurantTable, tableLabel } from '../../../../core/models/table.model';

@Component({
  selector: 'app-order-create', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-create.component.html', styleUrl: './order-create.component.scss',
})
export class OrderCreateComponent implements OnInit {
  menu: MenuItem[] = [];
  tables: RestaurantTable[] = [];
  quantities: Record<string, number> = {};
  tableId = '';
  reservationId: string | null = null;
  reservationCustomer = '';
  error = '';
  saving = false;
  readonly tableLabel = tableLabel;
  menuLoading = true;
  tablesLoading = true;

  constructor(
    private menuService: MenuService,
    private tablesService: TablesService,
    private ordersService: OrdersService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const requestedTableId = this.route.snapshot.queryParamMap.get('tableId');
    this.reservationId = this.route.snapshot.queryParamMap.get('reservationId');
    this.reservationCustomer = this.route.snapshot.queryParamMap.get('customer') || '';
    this.menuService.available().subscribe({
      next: (items) => { this.menu = items ?? []; this.menuLoading = false; },
      error: () => { this.menuLoading = false; this.error = 'No se pudo cargar el menú disponible.'; },
    });
    this.tablesService.available().subscribe({
      next: (tables) => {
        this.tables = tables ?? [];
        this.tablesLoading = false;
        if (requestedTableId) {
          if (this.tables.some((table) => table.id === requestedTableId)) {
            this.tableId = requestedTableId;
          } else {
            this.error = 'La mesa de la reserva ya no está disponible.';
          }
        }
      },
      error: () => { this.tablesLoading = false; this.error = 'No se pudieron cargar las mesas libres.'; },
    });
  }
  quantity(item: MenuItem): number { return this.quantities[item.id!] || 0; }
  setQuantity(item: MenuItem, value: number): void { this.quantities[item.id!] = Math.max(0, Number(value) || 0); }
  get selected() { return this.menu.filter((item) => this.quantity(item) > 0); }
  get total(): number { return this.selected.reduce((sum, item) => sum + item.price * this.quantity(item), 0); }

  save(): void {
    if (!this.tableId || !this.selected.length) { this.error = 'Indica una mesa y al menos un producto.'; return; }
    this.saving = true; this.error = '';
    const items = this.selected.map((item) => ({ menuItemId: item.id!, quantity: this.quantity(item) }));
    this.ordersService.create({
      tableId: this.tableId,
      ...(this.reservationId ? { reservationId: this.reservationId } : {}),
      items,
      status: OrderStatus.PENDING,
    }).subscribe({
      next: (order) => this.router.navigate(['/orders', order.id]),
      error: (response) => { this.saving = false; const message = response.error?.message; this.error = Array.isArray(message) ? message.join(' ') : message || 'No se pudo crear la orden. Verifica el estado de la mesa.'; },
    });
  }
}
