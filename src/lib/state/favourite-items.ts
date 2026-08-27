import { itemsStore } from "$lib/state/items";
import { favouritesStore } from "$lib/state/favourites";
import { derived } from "svelte/store";

export const favouriteItemsStore = derived(
  [itemsStore, favouritesStore],
  ([$itemsStore, $favouritesStore]) => {
    if ($itemsStore && $favouritesStore) {
      return $itemsStore.map((item) => ({
        is_favourite: $favouritesStore.includes(item.id),
        ...item,
      }));
    }
  },
);
