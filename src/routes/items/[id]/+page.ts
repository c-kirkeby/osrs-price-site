import { getTimeSeries } from "$lib/api/time-series";

type TimeStep = "5m" | "1h" | "6h" | "24h";

export async function load({ params, fetch, url, depends }) {
  depends("items:history");
  const timeStepParam = url.searchParams.get("time_step");
  const allowedTimeSteps: TimeStep[] = ["5m", "1h", "6h", "24h"];
  const timeStep: TimeStep = allowedTimeSteps.includes(
    timeStepParam as TimeStep,
  )
    ? (timeStepParam as TimeStep)
    : "5m";

  return {
    history: await getTimeSeries(params.id, timeStep, {
      fetcher: fetch,
    }),
  };
}
