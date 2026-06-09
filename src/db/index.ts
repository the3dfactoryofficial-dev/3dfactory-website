import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as pgSchema from "./schema.pg"

const supabasePgClient = postgres(process.env.DATABASE_URL ?? "", { prepare: false })
export const db = drizzle(supabasePgClient, { schema: pgSchema })