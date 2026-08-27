import type { Item } from "$lib/types/item";
import { browser } from "$app/environment";

const initialHistory = JSON.parse(
  browser ? (localStorage.getItem("history") ?? "[]") : "[]",
);

export function createSearchHistory(initialItems: Partial<Item>[]) {
  let items = $state(initialItems ?? []);

  function add(item: Partial<Item>) {
    items = [item, ...items.filter((i) => i?.id !== item.id)].slice(0, 5);

    if (browser) {
      localStorage.setItem("history", JSON.stringify(items));
    }
  }
  function remove(item: Partial<Item>) {
    items = items.filter((i) => i?.id !== item.id);

    if (browser) {
      localStorage.setItem("history", JSON.stringify(items));
    }
  }

  return {
    get items() {
      return items;
    },
    add,
    remove,
  };
}

export const searchHistory = createSearchHistory(initialHistory);
