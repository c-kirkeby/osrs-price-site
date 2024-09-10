import type { TimeSeries, TimeStep } from "$lib/types/time-series";
import { subDays } from "date-fns";
import { headers } from "./headers";

export async function getTimeSeries(
  id: number | string,
  timeStep: TimeStep = "5m",
  options: { fetcher: typeof fetch } = {
    fetcher: fetch,
  },
): Promise<{ data: TimeSeries[] }> {
  const response = await options.fetcher(
    `https://prices.runescape.wiki/api/v1/osrs/timeseries?id=${id}&timestep=${timeStep}`,
    { headers },
  );
  const { data }: { data: TimeSeries[] } = await response.json();

  switch (timeStep) {
    case "5m":
    default:
      return {
        data: data.filter(
          (point) => point.timestamp >= subDays(new Date(), 1).getTime() / 1000,
        ),
      };
    case "1h":
      return {
        data: data.filter(
          (point) => point.timestamp >= subDays(new Date(), 7).getTime() / 1000,
        ),
      };
    case "6h":
      return {
        data: data.filter(
          (point) =>
            point.timestamp >= subDays(new Date(), 30).getTime() / 1000,
        ),
      };
    case "24h":
      return {
        data: data.filter(
          (point) =>
            point.timestamp >= subDays(new Date(), 365).getTime() / 1000,
        ),
      };
  }
}
