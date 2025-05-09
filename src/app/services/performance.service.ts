import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PerformanceData, PerformanceStats } from '../models/performance.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getPerformanceData(): Observable<PerformanceData[]> {
    // Try to get performance data from the API, fall back to generating mock data if it fails
    return this.http.get<any>(`${this.apiUrl}/performance/data`).pipe(
      map(response => {
        // Ensure we're returning an array
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // If it's an object but not an array, try to convert it to an array if possible
          // For example, if it has properties that should be array items
          const possibleArray = Object.values(response).filter(item => 
            item && typeof item === 'object' && 'name' in item && 'series' in item
          );
          return possibleArray.length > 0 ? possibleArray : [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching performance data from API', error);
        return this.generateMockPerformanceData();
      })
    );
  }
  
  getPerformanceStats(): Observable<PerformanceStats> {
    // Try to get performance stats from the API, fall back to generating mock stats if it fails
    return this.http.get<PerformanceStats>(`${this.apiUrl}/performance/stats`).pipe(
      map(stats => ({
        ...stats,
        lastUpdated: new Date(stats.lastUpdated)
      })),
      catchError(error => {
        console.error('Error fetching performance stats from API', error);
        return this.generateMockPerformanceStats();
      })
    );
  }

  generateInitialPerformanceData(): Observable<any> {
    // Generate initial performance data in the database
    return this.http.post<any>(`${this.apiUrl}/performance/generate-initial-data`, {}).pipe(
      catchError(error => {
        console.error('Error generating initial performance data', error);
        return of({ error: error.message });
      })
    );
  }

  updatePerformanceStatsFromPredictions(): Observable<PerformanceStats> {
    // Update performance stats based on prediction results
    return this.http.post<PerformanceStats>(`${this.apiUrl}/performance/stats/update-from-predictions`, {}).pipe(
      map(stats => ({
        ...stats,
        lastUpdated: new Date(stats.lastUpdated)
      })),
      catchError(error => {
        console.error('Error updating performance stats from predictions', error);
        return this.generateMockPerformanceStats();
      })
    );
  }

  private generateMockPerformanceData(): Observable<PerformanceData[]> {
    // Generate fake data for the past 30 days
    const today = new Date();
    const accuracyData: PerformanceData = {
      name: 'Bot Prediction Accuracy',
      series: []
    };
    
    const winRateData: PerformanceData = {
      name: 'Bot Win Rate',
      series: []
    };
    
    const humanWinRateData: PerformanceData = {
      name: 'Human Win Rate',
      series: []
    };
    
    // Start with some base values
    let accuracy = 65; // Start at 65% accuracy
    let botWinRate = 60;  // Start at 60% win rate
    let humanWinRate = 55; // Start at 55% win rate (slightly worse than bot)
    
    // Generate data for the last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // Randomly adjust accuracy and win rates for each day (within reasonable bounds)
      accuracy = Math.max(40, Math.min(90, accuracy + (Math.random() * 10 - 5)));
      botWinRate = Math.max(35, Math.min(85, botWinRate + (Math.random() * 8 - 4)));
      
      // Make human win rate sometimes better, sometimes worse than bot
      // This creates an interesting comparison where humans occasionally outperform the bot
      const differential = (Math.random() * 15 - 7); // Random value between -7 and +8
      humanWinRate = Math.max(30, Math.min(88, botWinRate + differential));
      
      accuracyData.series.push({
        name: dateStr,
        value: accuracy
      });
      
      winRateData.series.push({
        name: dateStr,
        value: botWinRate
      });
      
      humanWinRateData.series.push({
        name: dateStr,
        value: humanWinRate
      });
    }
    
    return of([accuracyData, winRateData, humanWinRateData]);
  }
  
  private generateMockPerformanceStats(): Observable<PerformanceStats> {
    // Generate fake stats
    const stats: PerformanceStats = {
      totalPredictions: 124,
      correctPredictions: 83,
      accuracy: 66.9, // 83/124 ≈ 66.9%
      streak: 4,
      lastUpdated: new Date(),
      botWinRate: 62.1,
      humanWinRate: 58.7
    };
    
    return of(stats);
  }
}
