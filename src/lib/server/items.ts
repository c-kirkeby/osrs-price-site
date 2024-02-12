import { isNotNull, and } from "drizzle-orm";
import { db } from "$lib/db";
import { items } from "$lib/db/schema";

export async function fetchItems() {
  return db
    .select()
    .from(items)
    .where(and(isNotNull(items.buy_price), isNotNull(items.sell_price)))
    .execute();
}
