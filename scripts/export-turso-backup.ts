import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env.local") })
config({ path: resolve(__dirname, "../.env") })

if (!process.env.TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL is not set")
  process.exit(1)
}

import { createClient } from "@libsql/client"
import * as fs from "fs"
import * as path from "path"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const outDir = resolve(__dirname, "../turso-backup")
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const tables = [
    "users",
    "categories",
    "products",
    "product_images",
    "product_videos",
    "testimonials",
    "inquiries",
  ] as const

  const manifest: Record<string, { rowCount: number; exportedAt: string }> = {}

  for (const table of tables) {
    const result = await client.execute(`SELECT * FROM "${table}" ORDER BY id`)
    const data = result.rows.map((r) => {
      const obj: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(r)) {
        obj[k] = v
      }
      return obj
    })
    const filePath = path.join(outDir, `${table}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
    manifest[table] = {
      rowCount: data.length,
      exportedAt: new Date().toISOString(),
    }
    console.log(`  ${table}: ${data.length} rows → turso-backup/${table}.json`)
  }

  const manifestPath = path.join(outDir, "manifest.json")
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8")
  console.log(`\nBackup manifest: turso-backup/manifest.json`)
  console.log("Turso backup complete.")
}

main().catch((err) => {
  console.error("Backup failed:", err)
  process.exit(1)
})
