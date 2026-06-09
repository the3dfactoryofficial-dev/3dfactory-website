import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { createClient } from "@libsql/client"
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql"
import * as schema from "./schema"
import * as pgSchema from "./schema.pg"

// ── Turso (legacy / rollback) ──
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN,
})
export const tursoDb = drizzleSqlite(tursoClient, { schema })

// ── Supabase (production) ──
const supabasePgClient = postgres(process.env.DATABASE_URL ?? "", { prepare: false })
export const supabaseDb = drizzle(supabasePgClient, { schema: pgSchema })

// ── Active db ──
export const db = supabaseDb as unknown as typeof tursoDb
