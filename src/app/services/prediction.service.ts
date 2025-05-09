import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Prediction } from '../models/prediction.model';
import { SportsDataService } from './sports-data.service';
import { map, switchMap, take, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'http://localhost:3000/api/db';
  private predictionSubject = new BehaviorSubject<Prediction | undefined>(undefined);
  private archivedPredictions: Prediction[] = [];
  private predictionExplanations = [
    "Our AI has analyzed the recent performance metrics, and it's clear that {winner} has a statistical edge in this matchup. Their offensive efficiency rating is off the charts, and their defense has been stifling opponents. Plus, our algorithm detected that {loser}'s star player had an extra slice of pizza last night, which historically correlates with a 12% decrease in jump shot accuracy. Science!",
    "After crunching the numbers, our AI is confidently picking {winner} to win this one. Not only have they been on a hot streak, but our sentiment analysis of their coach's pre-game playlist shows an unusually high number of victory anthems. Meanwhile, {loser} has been practicing in shoes that are statistically 0.03mm too tight, according to our advanced footwear analysis algorithm. These details matter, folks!",
    "The data doesn't lie, and it's screaming that {winner} will triumph today. Our AI has detected a perfect alignment of factors: home court advantage, favorable weather patterns, and the fact that their mascot had an especially energetic performance at their last game. Meanwhile, {loser} players have been spending 17% more time on social media this week, which our algorithm correlates with decreased focus. The choice is clear!",
    "Our AI has spoken, and it's picking {winner} with 73.6% confidence. The team's passing efficiency has improved by 8.2% in their last three games, and their hydration levels are reportedly optimal. Meanwhile, {loser} has been struggling with their third-quarter performance, possibly due to the team's recent switch to a new brand of energy bars that contain 0.5% less protein. In the world of sports analytics, these tiny details make all the difference!"
  ];

  constructor(
    private sportsDataService: SportsDataService,
    private http: HttpClient
  ) {
    // Initialize with a prediction for today
    this.loadDailyPrediction();
    // Load archived predictions
    this.loadArchivedPredictions();
  }

  private loadArchivedPredictions() {
    // Try to get archived predictions from the API, fall back to generating mock data if it fails
    this.http.get<any[]>(`${this.apiUrl}/predictions`).pipe(
      map(predictions => {
        // Convert string dates to Date objects and ensure game objects are properly formatted
        // Also map MongoDB _id to id for the Angular model
        return predictions.map(prediction => ({
          ...prediction,
          id: prediction._id, // Map MongoDB _id to id
          date: new Date(prediction.date),
          game: {
            ...prediction.game,
            id: prediction.game._id, // Map game _id to id
            startTime: new Date(prediction.game.startTime),
            homeTeam: {
              ...prediction.game.homeTeam,
              id: prediction.game.homeTeam._id // Map homeTeam _id to id
            },
            awayTeam: {
              ...prediction.game.awayTeam,
              id: prediction.game.awayTeam._id // Map awayTeam _id to id
            }
          }
        }));
      }),
      catchError(error => {
        console.error('Error fetching archived predictions from API', error);
        // Generate mock data as fallback
        this.generateMockArchivedPredictions();
        return of(this.archivedPredictions);
      })
    ).subscribe(predictions => {
      if (predictions && predictions.length > 0) {
        this.archivedPredictions = predictions;
      } else {
        // If no predictions were returned, generate mock data
        this.generateMockArchivedPredictions();
      }
    });
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

  private loadDailyPrediction() {
    // Try to get the latest prediction from the API
    this.http.get<any>(`${this.apiUrl}/predictions/latest`).pipe(
      map(prediction => {
        // Convert string dates to Date objects and ensure game object is properly formatted
        // Also map MongoDB _id to id for the Angular model
        return {
          ...prediction,
          id: prediction._id, // Map MongoDB _id to id
          date: new Date(prediction.date),
          game: {
            ...prediction.game,
            id: prediction.game._id, // Map game _id to id
            startTime: new Date(prediction.game.startTime),
            homeTeam: {
              ...prediction.game.homeTeam,
              id: prediction.game.homeTeam._id // Map homeTeam _id to id
            },
            awayTeam: {
              ...prediction.game.awayTeam,
              id: prediction.game.awayTeam._id // Map awayTeam _id to id
            }
          }
        };
      }),
      catchError(error => {
        console.error('Error fetching latest prediction from API', error);
        // Generate a prediction as fallback
        this.generateDailyPrediction();
        return this.predictionSubject.asObservable();
      })
    ).subscribe(prediction => {
      if (prediction) {
        this.predictionSubject.next(prediction);
      } else {
        // If no prediction was returned, generate one
        this.generateDailyPrediction();
      }
    });
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
        
        // Save the prediction to the API
        this.savePrediction(prediction).subscribe(
          savedPrediction => {
            if (savedPrediction && savedPrediction.id) {
              // Update the prediction with the saved ID
              prediction.id = savedPrediction.id;
              this.predictionSubject.next(prediction);
            }
          },
          error => console.error('Error saving prediction to API', error)
        );
      }
    });
  }

  getDailyPrediction(): Observable<Prediction | undefined> {
    // If we don't have a prediction yet, load one
    if (!this.predictionSubject.value) {
      this.loadDailyPrediction();
    }
    return this.predictionSubject.asObservable();
  }

  updateVotes(predictionId: string, voteType: 'agree' | 'disagree'): Observable<Prediction | undefined> {
    // Try to update votes in the API
    return this.http.post<any>(`${this.apiUrl}/predictions/${predictionId}/vote`, { voteType }).pipe(
      map(prediction => {
        // Convert string dates to Date objects and ensure game object is properly formatted
        // Also map MongoDB _id to id for the Angular model
        const updatedPrediction = {
          ...prediction,
          id: prediction._id, // Map MongoDB _id to id
          date: new Date(prediction.date),
          game: {
            ...prediction.game,
            id: prediction.game._id, // Map game _id to id
            startTime: new Date(prediction.game.startTime),
            homeTeam: {
              ...prediction.game.homeTeam,
              id: prediction.game.homeTeam._id // Map homeTeam _id to id
            },
            awayTeam: {
              ...prediction.game.awayTeam,
              id: prediction.game.awayTeam._id // Map awayTeam _id to id
            }
          }
        };
        
        // If this is the current prediction, update the subject
        const currentPrediction = this.predictionSubject.value;
        if (currentPrediction && currentPrediction.id === predictionId) {
          this.predictionSubject.next(updatedPrediction);
        }
        
        return updatedPrediction;
      }),
      catchError(error => {
        console.error('Error updating votes in API', error);
        
        // Fall back to local update
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
      })
    );
  }

  getArchivedPredictions(): Observable<Prediction[]> {
    // Try to get archived predictions from the API, fall back to local data if it fails
    return this.http.get<any[]>(`${this.apiUrl}/predictions`).pipe(
      map(predictions => {
        // Convert string dates to Date objects and ensure game objects are properly formatted
        // Also map MongoDB _id to id for the Angular model
        return predictions.map(prediction => ({
          ...prediction,
          id: prediction._id, // Map MongoDB _id to id
          date: new Date(prediction.date),
          game: {
            ...prediction.game,
            id: prediction.game._id, // Map game _id to id
            startTime: new Date(prediction.game.startTime),
            homeTeam: {
              ...prediction.game.homeTeam,
              id: prediction.game.homeTeam._id // Map homeTeam _id to id
            },
            awayTeam: {
              ...prediction.game.awayTeam,
              id: prediction.game.awayTeam._id // Map awayTeam _id to id
            }
          }
        })).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date (newest first)
      }),
      catchError(error => {
        console.error('Error fetching archived predictions from API', error);
        // Sort archived predictions by date (newest first)
        const sortedPredictions = [...this.archivedPredictions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return of(sortedPredictions);
      })
    );
  }

  savePrediction(prediction: Prediction): Observable<Prediction> {
    // Save the prediction to the API
    return this.http.post<any>(`${this.apiUrl}/predictions`, prediction).pipe(
      map(savedPrediction => {
        // Convert string dates to Date objects and ensure game object is properly formatted
        // Also map MongoDB _id to id for the Angular model
        return {
          ...savedPrediction,
          id: savedPrediction._id, // Map MongoDB _id to id
          date: new Date(savedPrediction.date),
          game: {
            ...savedPrediction.game,
            id: savedPrediction.game._id, // Map game _id to id
            startTime: new Date(savedPrediction.game.startTime),
            homeTeam: {
              ...savedPrediction.game.homeTeam,
              id: savedPrediction.game.homeTeam._id // Map homeTeam _id to id
            },
            awayTeam: {
              ...savedPrediction.game.awayTeam,
              id: savedPrediction.game.awayTeam._id // Map awayTeam _id to id
            }
          }
        };
      }),
      catchError(error => {
        console.error('Error saving prediction to API', error);
        return of(prediction);
      })
    );
  }

  archiveCurrentPrediction(): void {
    const currentPrediction = this.predictionSubject.value;
    if (currentPrediction) {
      this.archivedPredictions.push({...currentPrediction});
    }
  }
}
