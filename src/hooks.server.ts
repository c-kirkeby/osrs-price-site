import { db } from "$lib/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// Run on start-up
try {
  await migrate(db, { migrationsFolder: "drizzle" });
} catch (error) {
  console.error(error);
}
