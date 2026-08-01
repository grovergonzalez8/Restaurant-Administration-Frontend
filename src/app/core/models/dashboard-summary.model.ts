export interface DashboardMetric {
  total?: number;
  available?: number;
  occupied?: number;
  pending?: number;
  inProgress?: number;
  completed?: number;
  lowStock?: number;
  active?: number;
}

export interface DashboardSummary {
  tables?: DashboardMetric;
  orders?: DashboardMetric;
  kitchen?: DashboardMetric;
  menu?: DashboardMetric;
  inventory?: DashboardMetric;
}
