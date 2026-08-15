export interface TimeSeries {
  timestamp: number;
  avgHighPrice: number | null;
  avgLowPrice: number | null;
  highPriceVolume: number;
  lowPriceVolume: number;
}

export type TimeStep = "5m" | "1h" | "6h" | "24h";
export type TimeStepLabel =
  | "Last day"
  | "Last 7 days"
  | "Last 30 days"
  | "Last 12 months";

export interface TimeSeriesOption {
  value: TimeStep;
  label: TimeStepLabel;
}
