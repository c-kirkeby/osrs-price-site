import type { Lookback, TimeSeries } from "$lib/types/time-series";
import { headers } from "./headers";

export async function getTimeSeries(
  id: number | string,
  lookback: Lookback = "24h",
  options: { fetcher: typeof fetch } = {
    fetcher: fetch,
  },
): Promise<{ data: TimeSeries[] }> {
  const response = await options.fetcher(
    `https://prices.runescape.wiki/api/v2/osrs/timeseries?id=${id}&lookback=${lookback}`,
    { headers },
  );
  const { data }: { data: TimeSeries[] } = await response.json();

  return { data };
}
