import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryItem } from '../../core/models/inventory-item.model';
import { InventoryEntry } from '../../core/models/inventory-entry.model';
import { InventoryOutput } from '../../core/models/inventory-output.model';
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly url = `${environment.apiUrl}/inventory`;
  constructor(private http: HttpClient) {}
  items(): Observable<InventoryItem[]> { return this.http.get<InventoryItem[]>(`${this.url}/items`); }
  lowStock(): Observable<InventoryItem[]> { return this.http.get<InventoryItem[]>(`${this.url}/low-stock`); }
  create(item: Omit<InventoryItem, 'id'>) { return this.http.post<InventoryItem>(`${this.url}/items`, item); }
  getItems(): Observable<InventoryItem[]> { return this.items(); }
  getItem(id: string) { return this.http.get<InventoryItem>(`${this.url}/items/${id}`); }
  createItem(item: Omit<InventoryItem, 'id'>) { return this.create(item); }
  updateItem(id: string | undefined, item: Partial<InventoryItem>) { return this.http.put<InventoryItem>(`${this.url}/items/${id}`, item); }
  deleteItem(id: string | undefined) { return this.http.delete<void>(`${this.url}/items/${id}`); }
  getEntries() { return this.http.get<InventoryEntry[]>(`${this.url}/entries`); }
  createEntry(data: { itemId: string; quantity: number; note?: string } | InventoryEntry) { const itemId = 'itemId' in data ? data.itemId : data.item.id; return this.entry(itemId, data.quantity, data.note); }
  getOutputs() { return this.http.get<InventoryOutput[]>(`${this.url}/outputs`); }
  createOutput(data: { itemId: string; quantity: number; note?: string } | InventoryOutput) { const itemId = 'itemId' in data ? data.itemId : data.item.id; return this.output(itemId, data.quantity, data.note); }
  entry(itemId: string, quantity: number, note?: string) { return this.http.post(`${this.url}/entries`, { itemId, quantity, note }); }
  output(itemId: string, quantity: number, note?: string) { return this.http.post(`${this.url}/outputs`, { itemId, quantity, note }); }
}
