import { browser } from "$app/env";
import type { Item } from "$lib/types/item";

function createItems(initialItems: Item[]) {
  let items = $state(initialItems);

  return {
    get items() {
      return items;
    },
    set items(newItems: Item[]) {
      items = newItems;

      if (browser) {
        localStorage.setItem("items", JSON.stringify(newItems));
      }
    },
  };
}

function getInitialItems() {
  let items: Item[] | null = null;

  if (browser) {
    const storage = localStorage.getItem("items");

    if (storage) {
      items = JSON.parse(storage);
      console.info(`Restoring ${items?.length ?? 0} items from localStorage.`);
    }
  }

  return items ?? [];
}

export const itemsState = createItems(getInitialItems());
