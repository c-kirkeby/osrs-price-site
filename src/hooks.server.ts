import { syncUpstreamItemMappings, syncUpstreamPrices } from "$lib/db/sync";

import { db } from "$lib/db/pool";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// Run on start-up
try {
  await migrate(db, { migrationsFolder: "drizzle" });
  await syncUpstreamItemMappings();
  await syncUpstreamPrices();
} catch (error) {
  console.error(error);
}
