import type { Item } from "$lib/db/schema";
import { writable } from "svelte/store";

export const natureRuneItemId = 561;

export const natureRune = writable(
  {} as Pick<Item, "id" | "buy_price" | "buy_price_timestamp" | "last_updated">,
);
