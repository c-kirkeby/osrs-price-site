import { syncUpstreamPrices } from "$lib/db/sync";
import { fetchItems } from "$lib/server/items";

export async function load(params) {
  params.setHeaders({
    "Cache-Control": "max-age=1, stale-while-revalidate=59",
  });
  await syncUpstreamPrices();
  return {
    items: fetchItems(),
  };
}
