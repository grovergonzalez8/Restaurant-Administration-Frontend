import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSummary } from '../../core/models/dashboard-summary.model';
import { DashboardService } from './dashboard.service';
import { RealtimeService } from '../../core/services/realtime.service';

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule], templateUrl: './dashboard.component.html', styleUrl: './dashboard.component.scss' })
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = true;
  error = '';
  constructor(private dashboardService: DashboardService, realtime: RealtimeService) {
    ['order.created', 'order.updated', 'payment.created', 'inventory.entry', 'inventory.output'].forEach((event) => realtime.on(event, () => this.load()));
  }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.dashboardService.summary().subscribe({
      next: (summary) => { this.summary = summary; this.loading = false; },
      error: () => { this.error = 'No se pudo cargar el resumen operativo.'; this.loading = false; },
    });
  }
}
