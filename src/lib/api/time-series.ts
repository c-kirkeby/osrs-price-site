import type { TimeSeries } from "$lib/types/time-series";
import { headers } from "./headers";

export async function getTimeSeries(
  id: number | string,
  timeStep: "5m" | "1h" | "6h" | "24h" = "5m",
): Promise<{ data: TimeSeries[] }> {
  const response = await fetch(
    `https://prices.runescape.wiki/api/v1/osrs/timeseries?id=${id}&timestep=${timeStep}`,
    { headers },
  );
  return (await response.json()) as Promise<{ data: TimeSeries[] }>;
}
