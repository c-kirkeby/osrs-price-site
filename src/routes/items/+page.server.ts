import { db } from "$lib/db/pool";
import { items } from "$lib/db/schema";
import { sql } from "drizzle-orm";

export async function load({ url }) {
  const limit = Number(url.searchParams.get("page[limit]")) || 10;
  const offset = Number(url.searchParams.get("page[offset]")) || 0;
  const data = await db
    .select()
    .from(items)
    .limit(limit)
    .offset(offset)
    .execute();
  const count = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(items);
  return {
    items: data,
    count: count[0].count,
  };
}
