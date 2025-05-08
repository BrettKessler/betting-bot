import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';

import { PredictionService } from '../../services/prediction.service';
import { Prediction } from '../../models/prediction.model';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatChipsModule,
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent implements OnInit {
  // All predictions from the API
  allPredictions: Prediction[] = [];
  // Filtered predictions based on user selections
  filteredPredictions: Prediction[] = [];
  // Paginated predictions to display
  archivedPredictions: Prediction[] = [];
  
  loading = true;
  error = false;

  // Pagination settings
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 50];
  pageIndex = 0;
  totalPredictions = 0;

  // Filter options
  availableSports: string[] = [];
  selectedSport: string = '';
  dateRange: { start: Date | null, end: Date | null } = { start: null, end: null };
  teamFilter: string = '';
  votePercentageFilter: number | null = null;
  
  // Sort options
  sortOptions = [
    { value: 'date-desc', label: 'Date (Newest First)' },
    { value: 'date-asc', label: 'Date (Oldest First)' },
    { value: 'votes-desc', label: 'Most Votes' },
    { value: 'votes-asc', label: 'Least Votes' },
    { value: 'agree-desc', label: 'Highest Agreement' },
    { value: 'agree-asc', label: 'Lowest Agreement' }
  ];
  selectedSort = 'date-desc';

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.loadArchivedPredictions();
  }

  loadArchivedPredictions(): void {
    this.loading = true;
    this.error = false;
    
    this.predictionService.getArchivedPredictions().subscribe({
      next: (predictions) => {
        this.allPredictions = predictions;
        
        // Extract unique sports for the filter
        this.availableSports = [...new Set(predictions.map(p => p.game.sport))];
        
        // Apply initial filtering and pagination
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading archived predictions:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  // Handle page change events
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedResults();
  }

  // Apply all filters and update the displayed predictions
  applyFilters(): void {
    let filtered = [...this.allPredictions];
    
    // Filter by sport
    if (this.selectedSport) {
      filtered = filtered.filter(p => p.game.sport === this.selectedSport);
    }
    
    // Filter by date range
    filtered = this.filterByDateRange(filtered);
    
    // Filter by team name
    if (this.teamFilter) {
      const searchTerm = this.teamFilter.toLowerCase();
      filtered = filtered.filter(p => 
        p.game.homeTeam.name.toLowerCase().includes(searchTerm) || 
        p.game.awayTeam.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by vote percentage
    if (this.votePercentageFilter !== null) {
      const minPercentage = this.votePercentageFilter;
      filtered = filtered.filter(p => {
        const totalVotes = p.votes.agree + p.votes.disagree;
        if (totalVotes === 0) return false;
        
        const agreePercentage = Math.round((p.votes.agree / totalVotes) * 100);
        return agreePercentage >= minPercentage;
      });
    }
    
    // Apply sorting
    filtered = this.sortPredictions(filtered);
    
    this.filteredPredictions = filtered;
    this.totalPredictions = filtered.length;
    
    // Reset to first page when filters change
    this.pageIndex = 0;
    
    // Update paginated results
    this.updatePaginatedResults();
  }

  // Sort predictions based on selected sort option
  sortPredictions(predictions: Prediction[]): Prediction[] {
    const sorted = [...predictions];
    
    switch (this.selectedSort) {
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'votes-desc':
        return sorted.sort((a, b) => this.getTotalVotes(b) - this.getTotalVotes(a));
      case 'votes-asc':
        return sorted.sort((a, b) => this.getTotalVotes(a) - this.getTotalVotes(b));
      case 'agree-desc':
        return sorted.sort((a, b) => this.calculateAgreePercentage(b) - this.calculateAgreePercentage(a));
      case 'agree-asc':
        return sorted.sort((a, b) => this.calculateAgreePercentage(a) - this.calculateAgreePercentage(b));
      default:
        return sorted;
    }
  }

  // Update the paginated results based on current page and page size
  updatePaginatedResults(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.archivedPredictions = this.filteredPredictions.slice(startIndex, startIndex + this.pageSize);
  }

  // Reset all filters
  resetFilters(): void {
    this.selectedSport = '';
    this.dateRange = { start: null, end: null };
    this.teamFilter = '';
    this.votePercentageFilter = null;
    this.selectedSort = 'date-desc';
    this.applyFilters();
  }

  formatGameDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  getWinnerTeam(prediction: Prediction): string {
    return prediction.predictedWinner === 'home' 
      ? prediction.game.homeTeam.name 
      : prediction.game.awayTeam.name;
  }

  calculateAgreePercentage(prediction: Prediction): number {
    const totalVotes = prediction.votes.agree + prediction.votes.disagree;
    if (totalVotes === 0) return 0;
    return Math.round((prediction.votes.agree / totalVotes) * 100);
  }

  calculateDisagreePercentage(prediction: Prediction): number {
    const totalVotes = prediction.votes.agree + prediction.votes.disagree;
    if (totalVotes === 0) return 0;
    return Math.round((prediction.votes.disagree / totalVotes) * 100);
  }

  getTotalVotes(prediction: Prediction): number {
    return prediction.votes.agree + prediction.votes.disagree;
  }

  // Helper method to filter predictions by date range
  filterByDateRange(predictions: Prediction[]): Prediction[] {
    let filtered = [...predictions];
    
    if (this.dateRange.start) {
      const startDate = this.dateRange.start;
      filtered = filtered.filter(p => {
        const predictionDate = new Date(p.date);
        return startDate ? predictionDate >= startDate : true;
      });
    }
    
    if (this.dateRange.end) {
      const endDate = this.dateRange.end;
      filtered = filtered.filter(p => {
        const predictionDate = new Date(p.date);
        return endDate ? predictionDate <= endDate : true;
      });
    }
    
    return filtered;
  }
}
