import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Prediction } from '../../models/prediction.model';
import { PredictionService } from '../../services/prediction.service';

@Component({
  selector: 'app-voting-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressBarModule],
  templateUrl: './voting-widget.component.html',
  styleUrl: './voting-widget.component.scss'
})
export class VotingWidgetComponent implements OnInit {
  @Input() prediction?: Prediction;
  userVoted: 'agree' | 'disagree' | null = null;
  totalVotes = 0;
  agreePercentage = 0;
  disagreePercentage = 0;

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.calculateStats();
  }

  vote(type: 'agree' | 'disagree'): void {
    if (!this.prediction || this.userVoted) return;
    
    this.userVoted = type;
    
    this.predictionService.updateVotes(this.prediction.id, type).subscribe({
      next: (updatedPrediction) => {
        if (updatedPrediction) {
          this.prediction = updatedPrediction;
          this.calculateStats();
        }
      },
      error: (err) => {
        console.error('Error updating votes:', err);
        this.userVoted = null;
      }
    });
  }

  private calculateStats(): void {
    if (!this.prediction) return;
    
    this.totalVotes = this.prediction.votes.agree + this.prediction.votes.disagree;
    
    if (this.totalVotes > 0) {
      this.agreePercentage = Math.round((this.prediction.votes.agree / this.totalVotes) * 100);
      this.disagreePercentage = 100 - this.agreePercentage;
    } else {
      this.agreePercentage = 0;
      this.disagreePercentage = 0;
    }
  }
}
