import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class SportsDataService {
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

  constructor() { }

  getGames(): Observable<Game[]> {
    // In a real app, this would be an HTTP call to a sports API
    return of(this.dummyGames);
  }

  getGameById(id: string): Observable<Game | undefined> {
    const game = this.dummyGames.find(g => g.id === id);
    return of(game);
  }
}
