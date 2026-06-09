import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { createClient } from "@libsql/client"
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql"
import * as schema from "./schema"

// ── Turso (current production) ──
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN,
})
export const tursoDb = drizzleSqlite(tursoClient, { schema })

// ── Supabase (migration target) — typed loosely since schema differs ──
const supabasePgClient = postgres(process.env.DATABASE_URL ?? "", { prepare: false })
export const supabaseDb: any = drizzle(supabasePgClient)

// ── Active db — always matches the running schema ──
export const db = tursoDb
