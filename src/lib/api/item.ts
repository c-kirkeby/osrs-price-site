import type { Item } from "$lib/db/schema";
import { headers } from "./headers";

export async function getItem<T extends (keyof Item)[]>(
  id: number,
  fields?: T,
) {
  return (
    await (
      await fetch(
        `/items/${id}?` +
          new URLSearchParams(
            fields ? fields.map((field) => ["fields[items]", field]) : [],
          ).toString(),
        { headers },
      )
    ).json()
  )[0] as Pick<Item, T[number]>;
}
