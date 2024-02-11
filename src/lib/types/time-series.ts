export interface TimeSeries {
  timestamp: number;
  avgHighPrice: number;
  avgLowPrice: number;
  avgHighVolume: number;
  avgLowVolume: number;
}

export type TimeStep = "5m" | "1h" | "6h" | "24h";
