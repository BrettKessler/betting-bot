import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class SportsDataService {
  private apiUrl = 'http://localhost:3000/api';
  private dummyGames: Game[] = [
    {
      id: '1',
      sport: 'Basketball',
      homeTeam: {
        id: 'lakers',
        name: 'Los Angeles Lakers',
        logo: 'https://content.sportslogos.net/logos/6/17/thumbs/177.png'
      },
      awayTeam: {
        id: 'celtics',
        name: 'Boston Celtics',
        logo: 'https://content.sportslogos.net/logos/6/213/thumbs/slhg02hbef3j1ov4lsnwyol5o.png'
      },
      startTime: new Date(new Date().setHours(20, 0, 0, 0)),
      venue: 'Staples Center'
    },
    {
      id: '2',
      sport: 'Football',
      homeTeam: {
        id: 'chiefs',
        name: 'Kansas City Chiefs',
        logo: 'https://content.sportslogos.net/logos/7/162/thumbs/857.png'
      },
      awayTeam: {
        id: '49ers',
        name: 'San Francisco 49ers',
        logo: 'https://content.sportslogos.net/logos/7/179/thumbs/17994552009.png'
      },
      startTime: new Date(new Date().setHours(16, 30, 0, 0)),
      venue: 'Arrowhead Stadium'
    },
    {
      id: '3',
      sport: 'Baseball',
      homeTeam: {
        id: 'yankees',
        name: 'New York Yankees',
        logo: 'https://content.sportslogos.net/logos/53/68/thumbs/1256.png'
      },
      awayTeam: {
        id: 'redsox',
        name: 'Boston Red Sox',
        logo: 'https://content.sportslogos.net/logos/53/53/thumbs/c0whfsa9j0vbs079opk2s05lx.png'
      },
      startTime: new Date(new Date().setHours(19, 0, 0, 0)),
      venue: 'Yankee Stadium'
    }
  ];

  constructor(private http: HttpClient) { }

  getGames(): Observable<Game[]> {
    // Try to get games from the API, fall back to dummy data if it fails
    return this.http.get<Game[]>(`${this.apiUrl}/games`).pipe(
      map(games => {
        // Convert string dates to Date objects
        return games.map(game => ({
          ...game,
          startTime: new Date(game.startTime)
        }));
      }),
      catchError(error => {
        console.error('Error fetching games from API', error);
        return of(this.dummyGames);
      })
    );
  }

  getGameById(id: string): Observable<Game | undefined> {
    // Try to get game from the API, fall back to dummy data if it fails
    return this.http.get<Game>(`${this.apiUrl}/games/${id}`).pipe(
      map(game => ({
        ...game,
        startTime: new Date(game.startTime)
      })),
      catchError(error => {
        console.error(`Error fetching game with ID ${id} from API`, error);
        const game = this.dummyGames.find(g => g.id === id);
        return of(game);
      })
    );
  }

  getUpcomingGames(limit: number = 10): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games/upcoming?limit=${limit}`).pipe(
      map(games => {
        return games.map(game => ({
          ...game,
          startTime: new Date(game.startTime)
        }));
      }),
      catchError(error => {
        console.error('Error fetching upcoming games from API', error);
        return of(this.dummyGames);
      })
    );
  }

  getGamesBySport(sport: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games/sport/${sport}`).pipe(
      map(games => {
        return games.map(game => ({
          ...game,
          startTime: new Date(game.startTime)
        }));
      }),
      catchError(error => {
        console.error(`Error fetching games for sport ${sport} from API`, error);
        return of(this.dummyGames.filter(g => g.sport === sport));
      })
    );
  }
}
