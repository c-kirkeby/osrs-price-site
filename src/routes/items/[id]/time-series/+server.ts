import { json, type RequestEvent } from "@sveltejs/kit";
import type { TimeStep } from "$lib/types/time-series";
import { getTimeSeries } from "$lib/api/time-series";

export async function GET({ params, setHeaders, url }: RequestEvent) {
  setHeaders({
    "Cache-Control": "max-age=1, stale-while-revalidate=29",
  });
  const timeStep = (url.searchParams.get("timeStep") as TimeStep) ?? "5m";

  const data = await getTimeSeries(parseInt(params.id), timeStep);
  return json(data);
}
