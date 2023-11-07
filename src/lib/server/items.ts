import { db } from "$lib/db";
import { items } from "$lib/db/schema";

export async function fetchItems() {
  return db.select().from(items).execute();
}
