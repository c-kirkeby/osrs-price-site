import { fetchMappings, fetchPrices, fetchVolumes } from "$lib/api/items";

export async function load({ fetch }) {
  return {
    streamed: {
      mappings: fetchMappings(fetch),
      prices: fetchPrices(fetch),
      volumes: fetchVolumes(fetch),
    },
  };
}
