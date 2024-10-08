import type { Mapping, Price } from "$lib/api/items";

export type Item = Mapping & Price & { volume: number };

export type FavouriteItem = Item & { is_favourite: boolean };
