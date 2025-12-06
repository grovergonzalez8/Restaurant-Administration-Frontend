import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { InventoryItem } from '../../../../core/models/inventory-item.model';
import { InventoryService } from '../../inventory.service';
import { ItemFormDialogComponent } from '../item-form-dialog.component/item-form-dialog.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-items-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent implements OnInit {

  displayedColumns = ['name', 'quantity', 'unit', 'actions'];
  dataSource: InventoryItem[] = [];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private inventory: InventoryService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load () {
    this.loading = true;
    this.inventory.getItems().subscribe({
      next: res => { 
        this.dataSource = res;
        this.loading = false; 
      },
      error: err => {
        this.loading = false;
        this.snack.open('Error cargando inventario', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openCreate() {
    const ref = this.dialog.open(ItemFormDialogComponent, {
      width: '520px',
      data: { mode: 'create' }
    });
  }

  openEdit(item: InventoryItem) {
    const ref = this.dialog.open(ItemFormDialogComponent, {
      width: '520px',
      data: { mode: 'edit', item }
    });
  }

  view(item: InventoryItem) {
    this.router.navigate(['inventory', item.id]);
  }

  remove(item: InventoryItem) {
    if (!confirm(`Eliminar ${item.name}?`)) return;
    this.inventory.deleteItem(item.id).subscribe({
      next: () => {
        this.snack.open('Item eliminado', 'Cerrar', { duration: 2000 });
        this.load();
      },
      error: () => this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000 })
    });
  }
}
