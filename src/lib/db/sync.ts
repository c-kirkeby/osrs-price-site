import { db } from "$lib/db";
import { eq } from "drizzle-orm";
import { items } from "$lib/db/schema";

export interface Mapping {
  examine: string;
  members: boolean;
  id: number;
  lowalch?: number;
  limit?: number;
  value?: number;
  highalch?: number;
  icon?: string;
  name: string;
}

export interface Data<T> {
  data: Record<string, T>;
}

export interface Price {
  id: number;
  high?: number;
  highTime?: number;
  low?: number;
  lowTime?: number;
}

export async function syncUpstreamItemMappings(): Promise<void> {
  try {
    const response: Mapping[] = await fetch(
      "https://prices.runescape.wiki/api/v1/osrs/mapping",
      {
        headers: {
          "User-Agent": "osrs-price-site",
        },
      },
    ).then((res) => res.json());

    response.map((mapping) => {
      db.insert(items)
        .values(mapping)
        .onConflictDoUpdate({
          target: items.id,
          set: {
            is_members: mapping.members,
            name: mapping.name,
            examine_text: mapping.examine,
            alch_low: mapping.lowalch,
            alch_high: mapping.highalch,
            buy_limit: mapping.limit,
            value: mapping.value,
            icon: mapping.icon,
            last_updated: new Date(),
          },
        })
        .execute();
    });
    console.log(
      "Mappings updated at " +
        new Date().toLocaleString("en-AU", { timeZone: "Australia/Brisbane" }) +
        " AEST",
    );
  } catch (error) {
    console.error("Could not update mappings from upstream");
  }
}

export async function syncUpstreamPrices(): Promise<void> {
  try {
    const response: Data<Price> = await fetch(
      "https://prices.runescape.wiki/api/v1/osrs/latest",
      {
        headers: {
          "User-Agent": "osrs-price-site",
        },
      },
    ).then((res) => res.json());

    const { data } = response;

    Object.keys(data).forEach((id) => {
      const currentItem = data[id];
      db.update(items)
        .set({
          buy_price: currentItem.high,
          buy_price_timestamp: currentItem.highTime
            ? new Date(currentItem.highTime * 1000)
            : null,
          sell_price: currentItem.low,
          sell_price_timestamp: currentItem.lowTime
            ? new Date(currentItem.lowTime * 1000)
            : null,
          last_updated: new Date(),
        })
        .where(eq(items.id, Number(id)))
        .execute();
    });
    console.log(
      "Prices updated at " +
        new Date().toLocaleString("en-AU", { timeZone: "Australia/Brisbane" }) +
        " AEST",
    );
  } catch (error) {
    console.error("Could not update prices from upstream");
  }
}
