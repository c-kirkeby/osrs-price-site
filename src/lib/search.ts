import type { Item } from "./types/item";
import FlexSearch from "flexsearch";

let itemsIndex: FlexSearch.Index;
let items: Item[];

export function createItemsIndex(data: Item[]) {
  itemsIndex = new FlexSearch.Index({
    tokenize: "forward",
  });
  data.forEach(async (item, index) => {
    await itemsIndex.addAsync(index, item.name);
  });

  items = data;
}

export async function searchItemsIndex(searchTerm: string): Promise<Item[]> {
  const results = await itemsIndex.searchAsync(searchTerm);

  return results
    .map((result) => items[result as number])
    .filter((item) => typeof item !== "undefined");
}
