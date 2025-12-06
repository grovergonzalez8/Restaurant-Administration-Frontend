import { InventoryItem } from "./inventory-item.model";

export interface InventoryEntry {
    id: string;
    item: InventoryItem;
    quantity: number;
    note?: string;
    createdAt?: Date;
    updatedAt?: Date;
}