import type { Item } from "$lib/db/schema";

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
      )
    ).json()
  )[0] as Pick<Item, T[number]>;
}
