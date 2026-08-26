import { browser } from "$app/environment";
import type { Item } from "$lib/types/item";
import { writable, type Writable } from "svelte/store";

function createItems(initialItems: Item[] | null) {
  const store: Writable<Item[] | null> = writable(initialItems, () => {
    const subscribe = store.subscribe((value) => {
      if (browser) {
        localStorage.setItem("items", JSON.stringify(value));
      }
    });
    return subscribe;
  });

  const { subscribe, update, set } = store;

  return {
    subscribe,
    update,
    set,
  };
}

function getInitialItems() {
  let items = null;

  if (browser) {
    const storage = localStorage.getItem("items");

    if (storage) {
      items = JSON.parse(storage);
      console.info(`Restoring ${items.length ?? 0} items from localStorage.`);
    }
  }
  return items;
}

const initialItems = getInitialItems();

export const itemsStore = createItems(initialItems);
