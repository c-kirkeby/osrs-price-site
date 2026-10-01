export interface TimeSeries {
  timestamp: number;
  avgHighPrice: number | null;
  avgLowPrice: number | null;
  highPriceVolume: number;
  lowPriceVolume: number;
}

export type Lookback = "24h" | "7d" | "30d" | "1y";
export type LookbackLabel =
  | "Last day"
  | "Last 7 days"
  | "Last 30 days"
  | "Last 12 months";

export interface TimeSeriesOption {
  value: Lookback;
  label: LookbackLabel;
}
