import { syncUpstreamPrices } from "$lib/db/sync";
import { fetchItems } from "$lib/server/items";

export async function load() {
  await syncUpstreamPrices();
  return {
    items: fetchItems(),
  };
}
