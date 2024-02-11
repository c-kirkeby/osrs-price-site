import { json, type RequestEvent } from "@sveltejs/kit";
import type { TimeStep } from "$lib/types/time-series";
import { getTimeSeries } from "$lib/api/time-series";

export async function GET({ params, setHeaders }: RequestEvent) {
  setHeaders({
    "Cache-Control": "max-age=1, stale-while-revalidate=29",
  });
  let timeStep: TimeStep = "5m";
  if (params.timeStep && ["5m", "1h", "6h", "24h"].includes(params.timeStep)) {
    timeStep = params.timeStep as TimeStep;
  }

  const data = await getTimeSeries(parseInt(params.id), timeStep);
  return json(data);
}
