export interface Game {
  id: string;
  sport: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  startTime: Date;
  venue?: string;
}
