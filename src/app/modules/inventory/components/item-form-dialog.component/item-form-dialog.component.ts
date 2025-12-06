import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InventoryService } from '../../inventory.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InventoryItem } from '../../../../core/models/inventory-item.model';

@Component({
  selector: 'app-item-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './item-form-dialog.component.html',
  styleUrls: ['./item-form-dialog.component.scss'],
})
export class ItemFormDialogComponent implements OnInit {

  form: any;

  constructor(
    private fb: FormBuilder,
    private inv: InventoryService,
    private dialogRef: MatDialogRef<ItemFormDialogComponent>,
    private snack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required]
    });

    if (data?.mode) this.mode = data.mode;
  }

  mode: 'create' | 'edit' = 'create';
  saving = false;

  ngOnInit(): void {
    if (this.data?.mode === 'edit' && this.data?.item) {
      const it = this.data.item;
      this.form.patchValue({
        name: it.name,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit
      });
    }
  }

  
  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const formValue = this.form.value;
    const payload: any = {
      name: formValue.name,
      description: formValue.description,
      quantity: formValue.quantity,
      unit: formValue.quantity
    };

    if (this.mode === 'create') {
      this.inv.createItem(payload).subscribe({
        next: () => { this.saving = false; this.snack.open('Item creado', 'Cerrar', {duration:2000}); this.dialogRef.close('ok'); },
        error: () => { this.saving = false; this.snack.open('Error', 'Cerrar', {duration:3000}); }
      });
    } else if (this.mode === 'edit' && this.data?.item) {
      this.inv.updateItem(this.data.item.id, payload).subscribe({
        next: () => { this.saving = false; this.snack.open('Item actualizado', 'Cerrar', {duration:2000}); this.dialogRef.close('ok'); },
        error: () => { this.saving = false; this.snack.open('Error', 'Cerrar', {duration:3000}); }
      });
    }
  }

  close() { 
    this.dialogRef.close(); 
  }
}
