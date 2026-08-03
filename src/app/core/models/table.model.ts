export interface RestaurantTable {
  id: string;
  number?: number;
  name?: string;
}

export function tableLabel(table?: RestaurantTable | null): string {
  const name = table?.name?.trim();
  if (name) return name;
  if (table?.number != null) return `Mesa ${table.number}`;
  return 'Mesa sin número';
}
