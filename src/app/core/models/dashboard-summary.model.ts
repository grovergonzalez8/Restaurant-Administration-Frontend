export interface DashboardMetric {
  total?: number;
  free?: number;
  available?: number;
  occupied?: number;
  pending?: number;
  inProgress?: number;
  completed?: number;
  active?: number;
}

export interface DashboardSummary {
  tables?: DashboardMetric;
  orders?: DashboardMetric;
  kitchen?: DashboardMetric;
  menu?: DashboardMetric;
  inventory?: DashboardMetric;
  sales?: { payments: number; total: number };
  reservations?: { pending: number; confirmed: number };
  lowStock?: Array<{ id: string; name: string; quantity: number; unit: string }>;
}
