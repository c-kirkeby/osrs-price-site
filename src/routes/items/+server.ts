import { db } from "$lib/db";
import { items, type Item } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { syncUpstreamPrices } from "$lib/db/sync";

export async function GET({ setHeaders, url }) {
  let fields: Partial<keyof Item>[] = [];

  if (url.searchParams.has("fields[items]")) {
    fields = url.searchParams.getAll("fields[items]");
  }
  setHeaders({
    "Cache-Control": "max-age=1, stale-while-revalidate=59",
  });
  await syncUpstreamPrices();
  const select = fields
    ? fields.reduce((obj, field) => {
        obj[field] = items[field];
        return obj;
      }, {})
    : {};
  const itemQuery = db.select(select).from(items).execute();

  const data = await itemQuery;
  return json(data);
}
