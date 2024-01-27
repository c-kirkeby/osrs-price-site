
import { json } from "@sveltejs/kit";
import { getTimeSeries } from "$lib/api/time-series";

export async function GET({ params, setHeaders }) {
  setHeaders({
    "Cache-Control": "max-age=1, stale-while-revalidate=29",
  });
  const timeStep = params.timeStep ?? "5m";
  const data = await getTimeSeries(parseInt(params.id), timeStep);
  return json(data);
}
