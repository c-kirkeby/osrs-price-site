import type { Item } from "$lib/db/schema";
import { headers } from "./headers";

export async function getItem<T extends (keyof Item)[]>(
  id: number,
  fields?: T,
) {
  const response = await fetch(
    `/api/item/${id}` +
      new URLSearchParams(fields ? { fields: fields.join(",") } : {}),
    {
      headers,
    },
  );
  return (await response.json()) as Promise<Pick<Item, T[number]>>;
}
