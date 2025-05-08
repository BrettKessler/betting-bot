import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { GamePredictionComponent } from '../../components/game-prediction/game-prediction.component';
import { VotingWidgetComponent } from '../../components/voting-widget/voting-widget.component';
import { PerformanceChartComponent } from '../../components/performance-chart/performance-chart.component';
import { PredictionService } from '../../services/prediction.service';
import { Prediction } from '../../models/prediction.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    GamePredictionComponent, 
    VotingWidgetComponent,
    PerformanceChartComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  prediction?: Prediction;
  
  constructor(private predictionService: PredictionService) {}
  
  ngOnInit(): void {
    this.loadPrediction();
  }
  
  loadPrediction(): void {
    this.predictionService.getDailyPrediction().subscribe({
      next: (prediction) => {
        this.prediction = prediction;
      },
      error: (err) => {
        console.error('Error loading prediction:', err);
      }
    });
  }
}
