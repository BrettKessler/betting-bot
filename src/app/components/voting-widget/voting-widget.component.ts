import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class VotingWidgetComponent implements OnInit, OnChanges {
  @Input() prediction?: Prediction;
  userVoted: 'agree' | 'disagree' | null = null;
  totalVotes = 0;
  agreePercentage = 0;
  disagreePercentage = 0;
  votingDisabled = false;
  votingDisabledReason = '';

  private readonly VOTE_STORAGE_KEY = 'user_votes';

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.calculateStats();
    this.checkPreviousVote();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prediction'] && !changes['prediction'].firstChange) {
      this.calculateStats();
      this.checkPreviousVote();
    }
  }

  private checkPreviousVote(): void {
    if (!this.prediction) return;
    
    // Check if user has already voted on this prediction
    const userVotes = this.getUserVotes();
    const predictionVote = userVotes[this.prediction.id];
    
    if (predictionVote) {
      // User has already voted on this prediction
      this.userVoted = predictionVote.type;
      
      // Check if the vote was within the last 24 hours
      const voteDate = new Date(predictionVote.date);
      const now = new Date();
      const hoursSinceVote = (now.getTime() - voteDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceVote < 24) {
        this.votingDisabled = true;
        this.votingDisabledReason = 'You can only vote once per day';
      }
    }
    
    // Also check if user has voted on any prediction in the last 24 hours
    if (!this.votingDisabled) {
      const hasRecentVote = this.hasVotedInLast24Hours(userVotes);
      if (hasRecentVote && !this.userVoted) {
        this.votingDisabled = true;
        this.votingDisabledReason = 'You can only vote once per day';
      }
    }
  }

  private getUserVotes(): Record<string, { type: 'agree' | 'disagree', date: string }> {
    // Check if localStorage is available (not available during server-side rendering)
    if (typeof window !== 'undefined' && window.localStorage) {
      const votesJson = localStorage.getItem(this.VOTE_STORAGE_KEY);
      return votesJson ? JSON.parse(votesJson) : {};
    }
    return {};
  }

  private saveUserVote(predictionId: string, voteType: 'agree' | 'disagree'): void {
    // Check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      const userVotes = this.getUserVotes();
      userVotes[predictionId] = {
        type: voteType,
        date: new Date().toISOString()
      };
      localStorage.setItem(this.VOTE_STORAGE_KEY, JSON.stringify(userVotes));
    }
  }

  private hasVotedInLast24Hours(votes: Record<string, { type: 'agree' | 'disagree', date: string }>): boolean {
    const now = new Date();
    
    for (const predictionId in votes) {
      if (predictionId === this.prediction?.id) continue; // Skip current prediction
      
      const voteDate = new Date(votes[predictionId].date);
      const hoursSinceVote = (now.getTime() - voteDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceVote < 24) {
        return true;
      }
    }
    
    return false;
  }

  vote(type: 'agree' | 'disagree'): void {
    if (!this.prediction || this.userVoted || this.votingDisabled) return;
    
    this.userVoted = type;
    
    this.predictionService.updateVotes(this.prediction.id, type).subscribe({
      next: (updatedPrediction) => {
        if (updatedPrediction) {
          this.prediction = updatedPrediction;
          this.calculateStats();
          
          // Save the vote to localStorage
          this.saveUserVote(this.prediction.id, type);
          
          // Disable voting for 24 hours
          this.votingDisabled = true;
          this.votingDisabledReason = 'You can only vote once per day';
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
