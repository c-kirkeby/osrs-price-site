import { syncUpstreamPrices } from "$lib/db/sync";
import { fetchItems } from "$lib/server/items";

export async function load(params) {
  params.setHeaders({
    "Cache-Control": "max-age=60",
  });
  await syncUpstreamPrices();
  return {
    items: fetchItems(),
  };
}
