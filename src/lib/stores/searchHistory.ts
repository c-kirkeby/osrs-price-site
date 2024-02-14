import type { Item } from "$lib/db/schema";
import { writable } from "svelte/store";

function createSearchHistory(initialItems: Partial<Item>[]) {
  const { subscribe, update } = writable(initialItems);

  function add(item: Partial<Item>) {
    update((items) => {
      return [item, ...items.filter((i) => i.id !== item.id)].slice(0, 5);
    });
  }

  function remove(item: Partial<Item>) {
    update((items) => {
      const newItems = items.filter((i) => i.id !== item.id);
      return newItems;
    });
  }

  return {
    subscribe,
    add,
    remove,
  };
}

export const searchHistory = createSearchHistory([]);
