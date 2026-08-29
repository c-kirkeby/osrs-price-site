import { itemsState } from "./items.svelte";
import { favouritesState } from "./favourites.svelte";

const favouriteItems = $derived(
  itemsState.items.map((item) => ({
    is_favourite: favouritesState.favourites.includes(item.id),
    ...item,
  })),
);

export const favouriteItemsState = {
  get items() {
    return favouriteItems;
  },
};
