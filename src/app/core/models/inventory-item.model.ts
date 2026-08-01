export interface InventoryItem {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    minStock?: number;
    unit: string;
    createdAt?: Date;
    updatedAt?: Date;
}
