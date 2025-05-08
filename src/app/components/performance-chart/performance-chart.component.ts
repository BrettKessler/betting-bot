import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { PerformanceService } from '../../services/performance.service';
import { PerformanceData, PerformanceStats } from '../../models/performance.model';

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatCardModule],
  templateUrl: './performance-chart.component.html',
  styleUrl: './performance-chart.component.scss'
})
export class PerformanceChartComponent implements OnInit {
  performanceData: PerformanceData[] = [];
  stats: PerformanceStats | null = null;
  
  // Chart options
  view: [number, number] = [700, 300];
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Date';
  yAxisLabel: string = 'Percentage';
  timeline: boolean = false;
  colorScheme: string = 'cool';
  
  constructor(private performanceService: PerformanceService) {}
  
  ngOnInit(): void {
    this.loadPerformanceData();
    this.loadStats();
  }
  
  loadPerformanceData(): void {
    this.performanceService.getPerformanceData().subscribe(data => {
      this.performanceData = data;
    });
  }
  
  loadStats(): void {
    this.performanceService.getPerformanceStats().subscribe(stats => {
      this.stats = stats;
    });
  }
  
  onResize(event: any): void {
    this.view = [event.target.innerWidth / 1.35, 300];
  }
}
