import { db } from "$lib/db";
import { eq } from "drizzle-orm";
import { getTimeSeries } from "$lib/api/time-series";
import { items } from "$lib/db/schema";
import { syncUpstreamPrices } from "$lib/db/sync";

type TimeStep = "5m" | "1h" | "6h" | "24h";

export async function load({ params }) {
  const timeStep: TimeStep = "5m";
  await syncUpstreamPrices(parseInt(params.id));
  const data = await db
    .select()
    .from(items)
    .where(eq(items.id, parseInt(params.id)))
    .limit(1)
    .execute();
  return {
    item: data[0],
    streamed: {
      history: getTimeSeries(params.id, timeStep),
    },
  };
}
