import type { TimeSeries } from "$lib/types/time-series";
import { db } from "$lib/db";
import { eq } from "drizzle-orm";
import { headers } from "$lib/api/headers";
import { items } from "$lib/db/schema";
import { syncUpstreamPrices } from "$lib/db/sync";

export async function load({ params }) {
  await syncUpstreamPrices(parseInt(params.id));
  const fetchHistory = async (): Promise<{ data: TimeSeries[] }> =>
    await (
      await fetch(
        `https://prices.runescape.wiki/api/v1/osrs/timeseries?id=${params.id}&timestep=24h`,
        { headers },
      )
    ).json();
  const data = await db
    .select()
    .from(items)
    .where(eq(items.id, parseInt(params.id)))
    .limit(1)
    .execute();
  return {
    item: data[0],
    streamed: {
      history: await fetchHistory(),
    },
  };
}
