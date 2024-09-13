import { getItems } from "$lib/api/items";

export async function load({ fetch, depends }) {
  depends("app:items");

  return {
    streamed: {
      items: getItems(fetch),
    },
  };
}
