import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { InventoryEntry } from '../../core/models/inventory-entry.model';
import { InventoryItem } from '../../core/models/inventory-item.model';
import { InventoryOutput } from '../../core/models/inventory-output.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getItems() {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/items`);
  }

  getItem(id: string) {
    return this.http.get<InventoryItem>(`${this.apiUrl}/items/${id}`);
  }

  createItem(data: InventoryItem) {
    return this.http.post<InventoryItem>(`${this.apiUrl}/items`, data);
  }

  updateItem(id: string, data: InventoryItem) {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/items/${id}`, data);
  }

  deleteItem(id: string) {
    return this.http.delete(`${this.apiUrl}/items/${id}`);
  }

  getEntries() {
    return this.http.get<InventoryEntry[]>(`${this.apiUrl}/entries`);
  }

  createEntry(data: InventoryEntry) {
    return this.http.post<InventoryEntry>(`${this.apiUrl}/entries`, data);
  }

  getOutputs() {
    return this.http.get<InventoryOutput[]>(`${this.apiUrl}/outputs`);
  }

  createOutput(data: InventoryOutput) {
    return this.http.post<InventoryOutput>(`${this.apiUrl}/outputs`, data);
  }

}
