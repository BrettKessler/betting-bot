import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PerformanceData, PerformanceStats } from '../models/performance.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  constructor() { }

  getPerformanceData(): Observable<PerformanceData[]> {
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
  
  getPerformanceStats(): Observable<PerformanceStats> {
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
