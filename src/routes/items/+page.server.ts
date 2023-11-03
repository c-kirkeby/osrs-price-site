import { db } from "$lib/db";
import { items } from "$lib/db/schema";

export async function load() {
  const itemQuery = db.select().from(items).execute();
  const data = await itemQuery;
  return {
    items: data,
  };
}
