import { db } from "$lib/db/pool";
import { eq } from "drizzle-orm";
import { items } from "$lib/db/schema";

export async function load({ params }) {
  const data = await db
    .select()
    .from(items)
    .where(eq(items.id, parseInt(params.id)))
    .limit(1)
    .execute();
  return {
    item: data[0],
  };
}
