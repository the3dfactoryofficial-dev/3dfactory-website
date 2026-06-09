import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env.local") })
config({ path: resolve(__dirname, "../.env") })

import { createClient } from "@libsql/client"
import postgres from "postgres"

// ── Raw clients ──
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const pg = postgres(process.env.DATABASE_URL ?? "", { prepare: false })

// ── CLI args ──
const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")
const VALIDATE_ONLY = args.includes("--validate")
const IS_EXECUTE = !DRY_RUN && !VALIDATE_ONLY

// ── Helpers ──
// Wrapper for postgres unsafe that accepts unknown[] — safe for migration scripts
async function pgExec(sql: string, params: unknown[]): Promise<any[]> {
  return pg.unsafe(sql, params as any[])
}
function toBool(val: unknown): boolean {
  return val === 1 || val === true || val === "1" || val === "true"
}

let timestampRepairs: { table: string; id: string; column: string; old: string; replacement: string }[] = []

function repairTimestamp(table: string, id: string, col: string, val: unknown): string {
  if (!val || String(val) === "(datetime('now'))") {
    const now = new Date().toISOString()
    timestampRepairs.push({ table, id, column: col, old: String(val), replacement: now })
    return now
  }
  return String(val)
}

async function fetchAll(table: string): Promise<Record<string, unknown>[]> {
  const r = await turso.execute(`SELECT * FROM "${table}" ORDER BY id`)
  return r.rows.map((row) => {
    const obj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row)) obj[k] = v
    return obj
  })
}

function printRepairLog() {
  if (timestampRepairs.length === 0) {
    console.log("  No timestamp repairs needed.")
    return
  }
  console.log("\n  ─── TIMESTAMP REPAIR LOG ───")
  for (const r of timestampRepairs) {
    console.log(`  ${r.table}.${r.column} | ${r.id} | "${r.old}" → "${r.replacement}"`)
  }
  console.log(`  Total: ${timestampRepairs.length} value(s) repaired.\n`)
}

// ── Main ──
async function main() {
  console.log(`Turso → Supabase Migration`)
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : VALIDATE_ONLY ? "VALIDATE ONLY" : "EXECUTE"}\n`)

  // 1. Read all source data
  const users = await fetchAll("users")
  const categories = await fetchAll("categories")
  const products = await fetchAll("products")
  const productImages = await fetchAll("product_images")
  const productVideos = await fetchAll("product_videos")
  const testimonials = await fetchAll("testimonials")
  const inquiries = await fetchAll("inquiries")

  console.log("Source row counts:")
  console.log(`  users: ${users.length}`)
  console.log(`  categories: ${categories.length}`)
  console.log(`  products: ${products.length}`)
  console.log(`  product_images: ${productImages.length}`)
  console.log(`  product_videos: ${productVideos.length}`)
  console.log(`  testimonials: ${testimonials.length}`)
  console.log(`  inquiries: ${inquiries.length}`)
  console.log()

  if (VALIDATE_ONLY || DRY_RUN) {
    // In dry-run, still log what would be repaired
    for (const row of users) {
      repairTimestamp("users", String(row.id), "created_at", row.created_at)
      repairTimestamp("users", String(row.id), "updated_at", row.updated_at)
    }
    for (const row of categories) {
      repairTimestamp("categories", String(row.id), "created_at", row.created_at)
    }
    printRepairLog()
    console.log(`Run with --dry-run to preview, or without flags to execute.`)
    return
  }

  // 2. Insert in dependency order (raw SQL to avoid dialect mismatch)

  // ── users ──
  console.log("Inserting users...")
  for (const r of users) {
    const ca = repairTimestamp("users", String(r.id), "created_at", r.created_at)
    const ua = repairTimestamp("users", String(r.id), "updated_at", r.updated_at)
    await pgExec(
      `INSERT INTO users (id, email, name, image, role, created_at, updated_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.email, r.name, r.image, r.role, ca, ua, r.last_login_at || null]
    )
  }

  // ── categories ──
  console.log("Inserting categories...")
  for (const r of categories) {
    const ca = repairTimestamp("categories", String(r.id), "created_at", r.created_at)
    await pgExec(
      `INSERT INTO categories (id, name, slug, description, sort_order, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.name, r.slug, r.description, r.sort_order, toBool(r.is_active), ca]
    )
  }

  // ── products ──
  console.log("Inserting products...")
  for (const r of products) {
    await pgExec(
      `INSERT INTO products (
        id, name, slug, description, short_description, category_id, category,
        price_range, material, dimensions, technologies, featured_image,
        is_featured, is_active, supports_bulk_orders, customizable,
        print_time, finish_type, production_type, minimum_order_quantity,
        sort_order, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      ON CONFLICT (id) DO NOTHING`,
      [
        r.id, r.name, r.slug, r.description, r.short_description,
        r.category_id || null, r.category,
        r.price_range, r.material, r.dimensions, r.technologies, r.featured_image,
        toBool(r.is_featured), toBool(r.is_active),
        toBool(r.supports_bulk_orders), toBool(r.customizable),
        r.print_time, r.finish_type, r.production_type || null, r.minimum_order_quantity,
        r.sort_order,
        repairTimestamp("products", String(r.id), "created_at", r.created_at),
        repairTimestamp("products", String(r.id), "updated_at", r.updated_at),
      ]
    )
  }

  // ── product_images ──
  console.log("Inserting product_images...")
  for (const r of productImages) {
    await pgExec(
      `INSERT INTO product_images (id, product_id, image_url, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.product_id, r.image_url, r.sort_order, r.created_at]
    )
  }

  // ── product_videos ──
  console.log("Inserting product_videos...")
  for (const r of productVideos) {
    await pgExec(
      `INSERT INTO product_videos (id, product_id, video_url, thumbnail_url, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.product_id, r.video_url, r.thumbnail_url || "", r.sort_order, r.created_at]
    )
  }

  // ── testimonials ──
  console.log("Inserting testimonials...")
  for (const r of testimonials) {
    await pgExec(
      `INSERT INTO testimonials (id, name, role, company, content, rating, image_url, product_id, featured, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        r.id, r.name, r.role || "", r.company || "", r.content,
        r.rating, r.image_url || "", r.product_id || null,
        toBool(r.featured),
        r.created_at, r.updated_at,
      ]
    )
  }

  // ── inquiries ──
  console.log("Inserting inquiries...")
  for (const r of inquiries) {
    await pgExec(
      `INSERT INTO inquiries (id, name, email, phone, product, category, quantity, preferred_size, customizable, message, source_page, attachments, status, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        r.id, r.name, r.email, r.phone, r.product, r.category,
        r.quantity, r.preferred_size || "", toBool(r.customizable),
        r.message || "", r.source_page, r.attachments || "[]",
        r.status, r.user_id || null,
        repairTimestamp("inquiries", String(r.id), "created_at", r.created_at),
      ]
    )
  }

  printRepairLog()
  console.log("Migration complete.")
  await pg.end()
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
