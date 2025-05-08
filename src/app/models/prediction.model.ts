import { Game } from './game.model';

export interface Prediction {
  id: string;
  game: Game;
  predictedWinner: 'home' | 'away';
  explanation: string;
  date: Date;
  votes: {
    agree: number;
    disagree: number;
  };
}
