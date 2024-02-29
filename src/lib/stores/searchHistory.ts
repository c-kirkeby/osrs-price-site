import type { Item } from "$lib/db/schema";
import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";

function createSearchHistory(initialItems: Partial<Item>[]) {
  const store: Writable<Partial<Item>[]> = writable(initialItems, () => {
    const subscribe = store.subscribe((value) => {
      if (browser) {
        localStorage.setItem("history", JSON.stringify(value));
      }
    });
    return subscribe;
  });

  const { subscribe, update } = store;

  function add(item: Partial<Item>) {
    update((items) => {
      return [item, ...items.filter((i) => i?.id !== item.id)].slice(0, 5);
    });
  }

  function remove(item: Partial<Item>) {
    update((items) => {
      const newItems = items.filter((i) => i?.id !== item.id);
      return newItems;
    });
  }

  return {
    subscribe,
    add,
    remove,
  };
}

const initialHistory = JSON.parse(
  browser ? localStorage.getItem("history") ?? "[]" : "[]",
);

export const searchHistory = createSearchHistory(initialHistory);
