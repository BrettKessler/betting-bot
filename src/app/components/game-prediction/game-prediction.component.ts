import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Prediction } from '../../models/prediction.model';
import { PredictionService } from '../../services/prediction.service';

@Component({
  selector: 'app-game-prediction',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatChipsModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './game-prediction.component.html',
  styleUrl: './game-prediction.component.scss'
})
export class GamePredictionComponent implements OnInit {
  @Input() prediction?: Prediction;
  loading = true;
  error = false;

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    if (!this.prediction) {
      this.loadPrediction();
    } else {
      this.loading = false;
    }
  }

  loadPrediction(): void {
    this.loading = true;
    this.error = false;
    
    this.predictionService.getDailyPrediction().subscribe({
      next: (prediction) => {
        this.prediction = prediction;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading prediction:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getWinnerTeam(): string {
    if (!this.prediction) return '';
    return this.prediction.predictedWinner === 'home' 
      ? this.prediction.game.homeTeam.name 
      : this.prediction.game.awayTeam.name;
  }
  
  shareOnTwitter(): void {
    if (!this.prediction) return;
    
    const winnerTeam = this.getWinnerTeam();
    const loserTeam = this.prediction.predictedWinner === 'home' 
      ? this.prediction.game.awayTeam.name 
      : this.prediction.game.homeTeam.name;
    
    const tweetText = encodeURIComponent(
      `Bot Bet of the Day AI is picking ${winnerTeam} to beat ${loserTeam} today! Do you agree? Check out the prediction at botbetoftheday.com #SportsPrediction #AI`
    );
    
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  }

  getLoserTeam(): string {
    if (!this.prediction) return '';
    return this.prediction.predictedWinner === 'home' 
      ? this.prediction.game.awayTeam.name 
      : this.prediction.game.homeTeam.name;
  }

  getWinnerLogo(): string {
    if (!this.prediction) return '';
    return this.prediction.predictedWinner === 'home' 
      ? this.prediction.game.homeTeam.logo || '' 
      : this.prediction.game.awayTeam.logo || '';
  }

  getLoserLogo(): string {
    if (!this.prediction) return '';
    return this.prediction.predictedWinner === 'home' 
      ? this.prediction.game.awayTeam.logo || '' 
      : this.prediction.game.homeTeam.logo || '';
  }

  formatGameTime(date?: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatGameDate(date?: Date): string {
    if (!date) return '';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  calculateAgreePercentage(): number {
    if (!this.prediction) return 0;
    const totalVotes = this.prediction.votes.agree + this.prediction.votes.disagree;
    if (totalVotes === 0) return 0;
    return Math.round((this.prediction.votes.agree / totalVotes) * 100);
  }

  calculateDisagreePercentage(): number {
    if (!this.prediction) return 0;
    const totalVotes = this.prediction.votes.agree + this.prediction.votes.disagree;
    if (totalVotes === 0) return 0;
    return Math.round((this.prediction.votes.disagree / totalVotes) * 100);
  }

  getTotalVotes(): number {
    if (!this.prediction) return 0;
    return this.prediction.votes.agree + this.prediction.votes.disagree;
  }
}
