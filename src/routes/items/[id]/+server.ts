import { db } from "$lib/db";
import { items, type Item } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { syncUpstreamPrices } from "$lib/db/sync";
import { eq } from "drizzle-orm";

export async function GET({ params, setHeaders, url }) {
  let fields: Partial<keyof Item>[] = [];

  if (url.searchParams.has("fields[items]")) {
    fields = url.searchParams.getAll("fields[items]");
  }
  setHeaders({
    "Cache-Control": "max-age=1, stale-while-revalidate=29",
  });
  await syncUpstreamPrices(parseInt(params.id));
  const select = fields
    ? fields.reduce((obj, field) => {
      obj[field] = items[field];
      return obj;
    }, {})
    : {};
  const itemQuery = db
    .select(select)
    .from(items)
    .where(eq(items.id, parseInt(params.id)))
    .limit(1)
    .execute();

  const data = await itemQuery;
  return json(data);
}
