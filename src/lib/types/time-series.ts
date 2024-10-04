export interface TimeSeries {
  timestamp: number;
  avgHighPrice: number | null;
  avgLowPrice: number | null;
  highPriceVolume: number;
  lowPriceVolume: number;
}

export type TimeStep = "5m" | "1h" | "6h" | "24h";
export type TimeStepLabel = "1 Day" | "7 Days" | "1 Month" | "1 Year";

export interface TimeSeriesOption {
  value: TimeStep;
  label: TimeStepLabel;
}
