import { getItems } from "$lib/api/items";
import { getRecipes } from "$lib/api/recipes";
import { getTimeSeries } from "$lib/api/time-series";
import { config } from "$lib/config";
import type { TimeStep } from "$lib/types/time-series";
import {
  parseLoadSubsetOptions,
  queryCollectionOptions,
} from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/query-core";
import { createCollection, localStorageCollectionOptions } from "@tanstack/svelte-db";

export interface Favourite {
  id: number;
}

const queryClient = new QueryClient();

export const itemsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["items"],
    queryFn: () => getItems(),
    queryClient,
    getKey: (item) => item.id,
    refetchInterval: config.pollMs,
  }),
);

export const recipesCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["recipes"],
    queryFn: () => getRecipes(),
    queryClient,
    getKey: (recipe) => recipe.name,
    refetchInterval: config.pollMs,
  }),
);

export const favouritesCollection = createCollection(
  localStorageCollectionOptions<Favourite>({
    storageKey: "favourites-v1",
    getKey: (favourite) => favourite.id,
  }),
);

export function toggleFavourite(id: number, isFavourite: boolean) {
  if (isFavourite) {
    favouritesCollection.delete(id);
  } else {
    favouritesCollection.insert({ id });
  }
}

export const timeSeriesCollection = createCollection(
  queryCollectionOptions({
    queryKey: (opts) => {
      const { filters } = parseLoadSubsetOptions(opts);
      return ["time-series", filters.map((filter) => filter.value)];
    },
    queryFn: async (ctx) => {
      const { filters } = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
      const id = filters.find((filter) => filter.field[0] === "id")
        ?.value as number | undefined;
      const timeStep = filters.find((filter) => filter.field[0] === "timeStep")
        ?.value as TimeStep | undefined;

      if (id === undefined || timeStep === undefined) {
        return [];
      }

      const { data } = await getTimeSeries(id, timeStep);
      return data.map((point) => ({ ...point, id, timeStep }));
    },
    queryClient,
    getKey: (point) => point.timestamp,
    syncMode: "on-demand",
    refetchInterval: config.pollMs,
  }),
);
