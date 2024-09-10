import { derived } from "svelte/store";
import { itemsStore } from "./items";

const NATURE_RUNE_ID = 561;

export const alchPrice = derived(
  itemsStore,
  ($items) => $items.find((item) => item.id === NATURE_RUNE_ID) ?? null,
);
