export interface PerformanceData {
  name: string;
  series: {
    name: Date | string;
    value: number;
  }[];
}

export interface PerformanceStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  streak: number;
  lastUpdated: Date;
  botWinRate: number;
  humanWinRate: number;
}
