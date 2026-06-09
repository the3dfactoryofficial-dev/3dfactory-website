import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env.local") })
config({ path: resolve(__dirname, "../.env") })

import { createClient } from "@libsql/client"
import postgres from "postgres"

// ── Raw clients (no schema dependency) ──
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const pg = postgres(process.env.DATABASE_URL ?? "", { prepare: false })

// ── Helpers ──
async function countTurso(table: string): Promise<number> {
  const r = await turso.execute(`SELECT COUNT(*) as cnt FROM "${table}"`)
  return Number(r.rows[0].cnt)
}
async function countPg(table: string): Promise<number> {
  const r = await pg.unsafe(`SELECT COUNT(*) as cnt FROM "${table}"`)
  return Number(r[0].cnt)
}

async function fetchTurso(table: string): Promise<Record<string, unknown>[]> {
  const r = await turso.execute(`SELECT * FROM "${table}" ORDER BY id`)
  return r.rows.map((row) => {
    const obj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row)) obj[k] = v
    return obj
  })
}
async function fetchPg(table: string): Promise<Record<string, unknown>[]> {
  return pg.unsafe(`SELECT * FROM "${table}" ORDER BY id`)
}

async function main() {
  let failed = false

  console.log("═══════════════════════════════════════════════")
  console.log("     MIGRATION VERIFICATION REPORT")
  console.log("═══════════════════════════════════════════════\n")

  const ALL_TABLES = [
    "users", "categories", "products",
    "product_images", "product_videos",
    "testimonials", "inquiries",
  ] as const

  // ── 1. Row Counts ──
  console.log("─── 1. Row Counts ───")
  for (const table of ALL_TABLES) {
    const tc = await countTurso(table)
    const pc = await countPg(table)
    const ok = tc === pc
    console.log(`  ${ok ? "✅" : "❌"} ${table}: Turso=${tc}  Supabase=${pc}${ok ? "" : "  MISMATCH"}`)
    if (!ok) failed = true
  }

  // ── 2. ID Integrity ──
  console.log("\n─── 2. ID Integrity ───")
  for (const table of ALL_TABLES) {
    const [tRows, pRows] = await Promise.all([fetchTurso(table), fetchPg(table)])
    const tIds = new Set(tRows.map((r) => r.id))
    const pIds = new Set(pRows.map((r) => r.id))
    const missing = tRows.filter((r) => !pIds.has(r.id))
    const extra = pRows.filter((r) => !tIds.has(r.id))
    if (missing.length > 0) {
      console.error(`  ❌ ${table}: Missing from Supabase: ${missing.map((r) => r.id).join(", ")}`)
      failed = true
    }
    if (extra.length > 0) {
      console.error(`  ❌ ${table}: Extra in Supabase: ${extra.map((r) => r.id).join(", ")}`)
      failed = true
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log(`  ✅ ${table}: All ${tRows.length} IDs match`)
    }
  }

  // ── 3. FK Integrity ──
  console.log("\n─── 3. FK Integrity (Supabase) ───")
  const fkChecks = [
    { label: "products.category_id → categories.id", query: `SELECT COUNT(*) as cnt FROM products WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM categories)` },
    { label: "product_images.product_id → products.id", query: `SELECT COUNT(*) as cnt FROM product_images WHERE product_id NOT IN (SELECT id FROM products)` },
    { label: "product_videos.product_id → products.id", query: `SELECT COUNT(*) as cnt FROM product_videos WHERE product_id NOT IN (SELECT id FROM products)` },
    { label: "testimonials.product_id → products.id", query: `SELECT COUNT(*) as cnt FROM testimonials WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT id FROM products)` },
    { label: "inquiries.user_id → users.id", query: `SELECT COUNT(*) as cnt FROM inquiries WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users)` },
  ]
  for (const fk of fkChecks) {
    const r = await pg.unsafe(fk.query)
    const cnt = Number(r[0].cnt)
    console.log(`  ${cnt === 0 ? "✅" : "❌"} ${fk.label}: ${cnt} orphan(s)`)
    if (cnt > 0) failed = true
  }

  // ── 4. Product Counts By Category ──
  console.log("\n─── 4. Product Counts By Category ───")
  const categories = ["spiritual-decor", "cosplay", "prototypes", "custom"]
  for (const cat of categories) {
    const tCnt = (await fetchTurso("products")).filter((p) => p.category === cat).length
    const pCnt = (await fetchPg("products")).filter((p: any) => p.category === cat).length
    const ok = tCnt === pCnt
    console.log(`  ${ok ? "✅" : "❌"} ${cat}: Turso=${tCnt}  Supabase=${pCnt}${ok ? "" : "  MISMATCH"}`)
    if (!ok) failed = true
  }

  // ── 5. Featured Product Verification ──
  console.log("\n─── 5. Featured Product Verification ───")
  const tProds = await fetchTurso("products")
  const pProds = await fetchPg("products")
  for (const tp of tProds) {
    const pp = pProds.find((p: any) => p.id === tp.id)
    if (!pp) {
      console.error(`  ❌ ${tp.slug} (${tp.id}): missing in Supabase`)
      failed = true
      continue
    }
    const tFeat = tp.is_featured === 1 || tp.is_featured === true
    const pFeat = pp.is_featured === true || pp.is_featured === 1
    if (tFeat !== pFeat) {
      console.error(`  ❌ ${tp.slug} (${tp.id}): Turso featured=${tFeat}  Supabase featured=${pFeat}`)
      failed = true
    }
  }
  const tFeaturedCount = tProds.filter((p) => p.is_featured === 1 || p.is_featured === true).length
  const pFeaturedCount = pProds.filter((p: any) => p.is_featured === true || p.is_featured === 1).length
  console.log(`  ${tFeaturedCount === pFeaturedCount ? "✅" : "❌"} Featured count: ${tFeaturedCount} = ${pFeaturedCount}`)
  if (tFeaturedCount !== pFeaturedCount) failed = true

  // ── 6. Active Product Count ──
  console.log("\n─── 6. Active Product Count ───")
  const tActive = tProds.filter((p) => p.is_active === 1 || p.is_active === true).length
  const pActive = pProds.filter((p: any) => p.is_active === true || p.is_active === 1).length
  console.log(`  ${tActive === pActive ? "✅" : "❌"} Active products: ${tActive} = ${pActive}`)
  if (tActive !== pActive) failed = true

  // ── 7. Uniqueness Validation ──
  console.log("\n─── 7. Uniqueness Validation (Supabase) ───")
  const slugCheck = await pg.unsafe(`SELECT slug, COUNT(*) as cnt FROM products GROUP BY slug HAVING COUNT(*) > 1`)
  if (slugCheck.length > 0) {
    console.error(`  ❌ Duplicate product slugs: ${slugCheck.map((r: any) => r.slug).join(", ")}`)
    failed = true
  } else {
    console.log("  ✅ Product slugs: unique")
  }
  const catSlugCheck = await pg.unsafe(`SELECT slug, COUNT(*) as cnt FROM categories GROUP BY slug HAVING COUNT(*) > 1`)
  if (catSlugCheck.length > 0) {
    console.error(`  ❌ Duplicate category slugs: ${catSlugCheck.map((r: any) => r.slug).join(", ")}`)
    failed = true
  } else {
    console.log("  ✅ Category slugs: unique")
  }
  const emailCheck = await pg.unsafe(`SELECT email, COUNT(*) as cnt FROM users GROUP BY email HAVING COUNT(*) > 1`)
  if (emailCheck.length > 0) {
    console.error(`  ❌ Duplicate user emails: ${emailCheck.map((r: any) => r.email).join(", ")}`)
    failed = true
  } else {
    console.log("  ✅ User emails: unique")
  }

  // ── 8. Timestamp Cleanliness ──
  console.log("\n─── 8. Timestamp Cleanliness ───")
  for (const table of ["users", "categories"]) {
    const rows = await fetchPg(table)
    for (const row of rows) {
      if (row.created_at === "(datetime('now'))" || row.updated_at === "(datetime('now'))") {
        console.error(`  ❌ ${table} ${row.id}: literal "(datetime('now'))" still present`)
        failed = true
      }
    }
  }
  console.log("  ✅ No literal (datetime('now')) values remain")

  // ── Summary ──
  console.log("\n═══════════════════════════════════════════════")
  if (failed) {
    console.error("  ❌ VERIFICATION FAILED — see errors above")
    process.exit(1)
  } else {
    console.log("  ✅ VERIFICATION PASSED — all checks match")
  }
  console.log("═══════════════════════════════════════════════\n")

  await pg.end()
}

main().catch((err) => {
  console.error("Verification failed:", err)
  process.exit(1)
})
