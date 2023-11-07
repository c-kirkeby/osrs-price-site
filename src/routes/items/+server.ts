import { db } from "$lib/db";
import { items } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { syncUpstreamPrices } from "$lib/db/sync";

export async function GET(event) {
  event.setHeaders({
    "Cache-Control": "max-age=60",
  });
  await syncUpstreamPrices();
  const itemQuery = db.select().from(items).execute();
  const data = await itemQuery;
  return json(data);
}
