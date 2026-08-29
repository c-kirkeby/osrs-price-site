import { page } from "$app/state";
import { itemsState } from "./items.svelte";

const currentItem = $derived(
  itemsState.items.find((item) => item.id === Number(page.params.id)) ?? null,
);

export const currentItemState = {
  get item() {
    return currentItem;
  },
};
