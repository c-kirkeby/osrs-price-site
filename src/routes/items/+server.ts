import { db } from "$lib/db";
import { items } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { syncUpstreamPrices } from "$lib/db/sync";

export async function GET() {
  await syncUpstreamPrices();
  const itemQuery = db.select().from(items).execute();
  const data = await itemQuery;
  return json(data);
}
