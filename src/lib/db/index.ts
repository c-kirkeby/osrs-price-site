import * as schema from "$lib/db/schema";

import { DATABASE_URL } from "$env/static/private";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const db = drizzle(postgres(DATABASE_URL), { schema });
