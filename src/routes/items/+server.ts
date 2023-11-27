import { db } from "$lib/db";
import { items, type Item } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { syncUpstreamPrices } from "$lib/db/sync";
import { sql } from "drizzle-orm";

export async function GET({ setHeaders, url }) {
  let fields: Partial<keyof Item>[] = [];
  let select;

  if (url.searchParams.has("fields[items]")) {
    fields = url.searchParams.getAll("fields[items]");
    select = fields
      ? fields.reduce((obj, field) => {
          obj[field] = items[field];
          return obj;
        }, {})
      : undefined;
  }
  const itemQuery = select
    ? db.select(select).from(items)
    : db.select().from(items);

  if (url.searchParams.has("filter[name]")) {
    const tsQueryString = url.searchParams
      .get("filter[name]")
      ?.split(" ")
      .join(" & ");
    itemQuery.where(
      sql`to_tsvector('english', ${items.name}) @@ to_tsquery('english', ${tsQueryString})`,
    );
  } else {
    // Only sync upstream prices if we're not searching
    await syncUpstreamPrices();
  }

  const data = await itemQuery;

  setHeaders({
    "Cache-Control": "max-age=1, stale-while-revalidate=59",
  });
  return json(data);
}
