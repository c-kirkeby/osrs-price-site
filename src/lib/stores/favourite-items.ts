import { itemsStore } from "$lib/stores/items";
import { favouritesStore } from "$lib/stores/favourites";
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
