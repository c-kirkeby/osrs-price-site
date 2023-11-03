import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: integer("id").primaryKey(),
  name: text("name"),
  is_members: boolean("is_members"),
  alch_low: integer("alch_low"),
  alch_high: integer("alch_high"),
  buy_limit: integer("buy_limit"),
  value: integer("value"),
  buy_price: integer("buy_price"),
  buy_price_timestamp: timestamp("buy_price_timestamp"),
  sell_price: integer("sell_price"),
  sell_price_timestamp: timestamp("sell_price_timestamp"),
  icon: text("icon"),
  examine_text: text("examine_text"),
  last_updated: timestamp("last_updated"),
});

export type Item = InferSelectModel<typeof items>;
