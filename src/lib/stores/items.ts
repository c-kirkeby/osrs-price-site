import { browser } from "$app/environment";
import type { Item } from "$lib/types/item";
import { writable, type Writable } from "svelte/store";

function createItems(initialItems: Item[]) {
  const store: Writable<Item[]> = writable<Item[]>(initialItems, () => {
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

const initialItems = JSON.parse(
  browser ? (localStorage.getItem("items") ?? "[]") : "[]",
);

export const itemsStore = createItems(initialItems);
