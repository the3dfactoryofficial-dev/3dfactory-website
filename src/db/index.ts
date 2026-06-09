import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { createClient } from "@libsql/client"
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql"
import * as schema from "./schema"
import * as pgSchema from "./schema.pg"

// ── Supabase (production) ──
const supabasePgClient = postgres(process.env.DATABASE_URL ?? "", { prepare: false })
export const supabaseDb = drizzle(supabasePgClient, { schema: pgSchema })

// ── Active db ──
type SqliteDb = ReturnType<typeof drizzleSqlite>
export const db = supabaseDb as unknown as SqliteDb

// ── Turso (legacy / rollback) — lazy: never created at module load ──
let _tursoDb: SqliteDb | undefined
export function getTursoDb(): SqliteDb {
  if (!_tursoDb) {
    const tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL ?? "",
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    _tursoDb = drizzleSqlite(tursoClient, { schema })
  }
  return _tursoDb
}
