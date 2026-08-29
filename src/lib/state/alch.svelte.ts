import { itemsState } from "./items.svelte";

const NATURE_RUNE_ID = 561;

const alchPrice = $derived(
  itemsState.items.find((item) => item.id === NATURE_RUNE_ID) ?? null,
);

export const alchPriceState = {
  get price() {
    return alchPrice;
  },
};
