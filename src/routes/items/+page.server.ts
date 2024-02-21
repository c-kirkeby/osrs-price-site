import { syncUpstreamPrices, syncUpstreamVolumes } from "$lib/db/sync";
import { fetchItems } from "$lib/server/items";

export async function load(params) {
  params.setHeaders({
    "Cache-Control": "max-age=59, stale-while-revalidate=118",
  });

  Promise.allSettled([syncUpstreamPrices(), syncUpstreamVolumes()]);

  return {
    items: await fetchItems(),
  };
}
