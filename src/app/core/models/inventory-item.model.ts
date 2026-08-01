export interface InventoryItem {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    createdAt?: Date;
    updatedAt?: Date;
}