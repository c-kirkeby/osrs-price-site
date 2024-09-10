import { getTimeSeries } from "$lib/api/time-series";

type TimeStep = "5m" | "1h" | "6h" | "24h";

export async function load({ params, fetch }) {
  const timeStep: TimeStep = "5m";

  return {
    streamed: {
      history: getTimeSeries(params.id, timeStep, {
        fetcher: fetch,
      }),
    },
  };
}
