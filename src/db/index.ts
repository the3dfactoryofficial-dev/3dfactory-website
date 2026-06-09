import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { createClient } from "@libsql/client"
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql"
import * as schema from "./schema"
import * as pgSchema from "./schema.pg"

// ── Supabase (production) ──
const supabasePgClient = postgres(process.env.DATABASE_URL ?? "", { prepare: false })
export const db = drizzle(supabasePgClient, { schema: pgSchema })

// ── Turso (legacy / rollback) — lazy: never created at module load ──
let _tursoDb: ReturnType<typeof drizzleSqlite> | undefined
export function getTursoDb() {
  if (!_tursoDb) {
    const tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL ?? "",
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    _tursoDb = drizzleSqlite(tursoClient, { schema })
  }
  return _tursoDb
}
