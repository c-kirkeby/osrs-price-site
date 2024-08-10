import type { Item } from "$lib/db/schema";
import { writable } from "svelte/store";

export const itemsStore = writable([] as Item[]);
