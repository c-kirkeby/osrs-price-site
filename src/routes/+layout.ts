import { getItems } from "$lib/api/items";

export async function load({ fetch, depends }) {
  depends("app:items");

  return {
    items: await getItems(fetch),
  };
}
