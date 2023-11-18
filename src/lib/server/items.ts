import { isNotNull } from "drizzle-orm";
import { db } from "$lib/db";
import { items } from "$lib/db/schema";

export async function fetchItems() {
  return db
    .select()
    .from(items)
    .where(isNotNull(items.buy_price))
    .where(isNotNull(items.sell_price))
    .execute();
}
