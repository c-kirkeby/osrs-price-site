import { db } from "$lib/db";
import { eq } from "drizzle-orm";
import { items } from "$lib/db/schema";
import { syncUpstreamPrices } from "$lib/db/sync";

export async function load({ params }) {
  await syncUpstreamPrices(parseInt(params.id));
  const data = await db
    .select()
    .from(items)
    .where(eq(items.id, parseInt(params.id)))
    .limit(1)
    .execute();
  return {
    item: data[0],
  };
}
