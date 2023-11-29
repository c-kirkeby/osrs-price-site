import { db } from "$lib/db";
import { eq } from "drizzle-orm";
import { items } from "$lib/db/schema";
import { natureRuneItemId } from "$lib/stores/alch";
import { syncUpstreamPrices } from "$lib/db/sync";

export async function load() {
  await syncUpstreamPrices(natureRuneItemId);
  const data = await db
    .select()
    .from(items)
    .where(eq(items.id, natureRuneItemId))
    .limit(1)
    .execute();
  return {
    natureRunePrice: data[0],
  };
}
