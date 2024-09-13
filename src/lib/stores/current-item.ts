import { derived } from "svelte/store";
import { itemsStore } from "./items";

export const currentItem = derived(
  [itemsStore, page],
  ($values) =>
    $values?.[0]?.find((item) => item.id === Number($values[1].params.id)) ??
    null,
);
