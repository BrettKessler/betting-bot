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
  chartReady: boolean = false;
  
  constructor(private performanceService: PerformanceService) {}
  
  ngOnInit(): void {
    this.loadPerformanceData();
    this.loadStats();
    
    // Set initial view size based on window width
    this.setInitialViewSize();
  }
  
  private setInitialViewSize(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      // Check if window is available (client-side only)
      if (typeof window !== 'undefined') {
        const containerWidth = window.innerWidth;
        // Use a safe default if width is not available or is too small
        const width = containerWidth > 0 ? Math.min(containerWidth * 0.8, 900) : 700;
        this.view = [width, 300];
      } else {
        // Server-side rendering - use default values
        this.view = [700, 300];
      }
      this.chartReady = true;
    }, 0);
  }
  
  loadPerformanceData(): void {
    this.performanceService.getPerformanceData().subscribe(data => {
      // Ensure data is an array before assigning it
      this.performanceData = Array.isArray(data) ? data : [];
    });
  }
  
  loadStats(): void {
    this.performanceService.getPerformanceStats().subscribe(stats => {
      this.stats = stats;
    });
  }
  
  onResize(event: any): void {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const width = event.target.innerWidth;
      // Ensure we never set invalid dimensions
      if (width > 0) {
        this.view = [Math.min(width / 1.35, 900), 300];
      } else {
        this.view = [700, 300]; // Safe fallback
      }
    }
  }
}
