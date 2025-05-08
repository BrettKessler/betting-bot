import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Prediction } from '../models/prediction.model';
import { SportsDataService } from './sports-data.service';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private predictionSubject = new BehaviorSubject<Prediction | undefined>(undefined);
  private archivedPredictions: Prediction[] = [];
  private predictionExplanations = [
    "Our AI has analyzed the recent performance metrics, and it's clear that {winner} has a statistical edge in this matchup. Their offensive efficiency rating is off the charts, and their defense has been stifling opponents. Plus, our algorithm detected that {loser}'s star player had an extra slice of pizza last night, which historically correlates with a 12% decrease in jump shot accuracy. Science!",
    "After crunching the numbers, our AI is confidently picking {winner} to win this one. Not only have they been on a hot streak, but our sentiment analysis of their coach's pre-game playlist shows an unusually high number of victory anthems. Meanwhile, {loser} has been practicing in shoes that are statistically 0.03mm too tight, according to our advanced footwear analysis algorithm. These details matter, folks!",
    "The data doesn't lie, and it's screaming that {winner} will triumph today. Our AI has detected a perfect alignment of factors: home court advantage, favorable weather patterns, and the fact that their mascot had an especially energetic performance at their last game. Meanwhile, {loser} players have been spending 17% more time on social media this week, which our algorithm correlates with decreased focus. The choice is clear!",
    "Our AI has spoken, and it's picking {winner} with 73.6% confidence. The team's passing efficiency has improved by 8.2% in their last three games, and their hydration levels are reportedly optimal. Meanwhile, {loser} has been struggling with their third-quarter performance, possibly due to the team's recent switch to a new brand of energy bars that contain 0.5% less protein. In the world of sports analytics, these tiny details make all the difference!"
  ];

  constructor(private sportsDataService: SportsDataService) {
    // Initialize with a prediction for today
    this.generateDailyPrediction();
    // Generate some mock archived predictions
    this.generateMockArchivedPredictions();
  }

  private generateMockArchivedPredictions() {
    // Generate 10 mock archived predictions
    for (let i = 0; i < 10; i++) {
      this.sportsDataService.getGames().pipe(
        take(1),
        map(games => {
          const randomIndex = Math.floor(Math.random() * games.length);
          return games[randomIndex];
        })
      ).subscribe(game => {
        if (game) {
          const predictedWinner = Math.random() > 0.5 ? 'home' : 'away';
          const winnerTeam = predictedWinner === 'home' ? game.homeTeam.name : game.awayTeam.name;
          const loserTeam = predictedWinner === 'home' ? game.awayTeam.name : game.homeTeam.name;
          
          const randomExplanationIndex = Math.floor(Math.random() * this.predictionExplanations.length);
          let explanation = this.predictionExplanations[randomExplanationIndex];
          explanation = explanation.replace('{winner}', winnerTeam).replace('{loser}', loserTeam);

          // Create past date (1-30 days ago)
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - (i + 1));

          const prediction: Prediction = {
            id: `archived-${i}`,
            game: game,
            predictedWinner: predictedWinner,
            explanation: explanation,
            date: pastDate,
            votes: {
              agree: Math.floor(Math.random() * 200),
              disagree: Math.floor(Math.random() * 200)
            }
          };

          this.archivedPredictions.push(prediction);
        }
      });
    }
  }

  private generateDailyPrediction() {
    this.sportsDataService.getGames().pipe(
      take(1),
      map(games => {
        // Randomly select a game
        const randomIndex = Math.floor(Math.random() * games.length);
        return games[randomIndex];
      })
    ).subscribe(game => {
      if (game) {
        // Randomly decide winner (home or away)
        const predictedWinner = Math.random() > 0.5 ? 'home' : 'away';
        
        // Get team names for the explanation
        const winnerTeam = predictedWinner === 'home' ? game.homeTeam.name : game.awayTeam.name;
        const loserTeam = predictedWinner === 'home' ? game.awayTeam.name : game.homeTeam.name;
        
        // Select a random explanation template and fill in the team names
        const randomExplanationIndex = Math.floor(Math.random() * this.predictionExplanations.length);
        let explanation = this.predictionExplanations[randomExplanationIndex];
        explanation = explanation.replace('{winner}', winnerTeam).replace('{loser}', loserTeam);

        // Create the prediction
        const prediction: Prediction = {
          id: '1',
          game: game,
          predictedWinner: predictedWinner,
          explanation: explanation,
          date: new Date(),
          votes: {
            agree: Math.floor(Math.random() * 100),
            disagree: Math.floor(Math.random() * 100)
          }
        };

        this.predictionSubject.next(prediction);
      }
    });
  }

  getDailyPrediction(): Observable<Prediction | undefined> {
    // If we don't have a prediction yet, generate one
    if (!this.predictionSubject.value) {
      this.generateDailyPrediction();
    }
    return this.predictionSubject.asObservable();
  }

  updateVotes(predictionId: string, voteType: 'agree' | 'disagree'): Observable<Prediction | undefined> {
    const currentPrediction = this.predictionSubject.value;
    
    if (currentPrediction && currentPrediction.id === predictionId) {
      const updatedPrediction = { ...currentPrediction };
      
      if (voteType === 'agree') {
        updatedPrediction.votes = {
          ...updatedPrediction.votes,
          agree: updatedPrediction.votes.agree + 1
        };
      } else {
        updatedPrediction.votes = {
          ...updatedPrediction.votes,
          disagree: updatedPrediction.votes.disagree + 1
        };
      }
      
      this.predictionSubject.next(updatedPrediction);
    }
    
    return of(this.predictionSubject.value);
  }

  getArchivedPredictions(): Observable<Prediction[]> {
    // Sort archived predictions by date (newest first)
    const sortedPredictions = [...this.archivedPredictions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return of(sortedPredictions);
  }

  archiveCurrentPrediction(): void {
    const currentPrediction = this.predictionSubject.value;
    if (currentPrediction) {
      this.archivedPredictions.push({...currentPrediction});
    }
  }
}
