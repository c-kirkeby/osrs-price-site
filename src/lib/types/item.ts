import type { Mapping, Price } from "$lib/api/items";

export type Item = Mapping & Price & { volume: number };
