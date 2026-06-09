import { db } from "@/db"
import { categories, products } from "@/db/schema.pg"
import { eq } from "drizzle-orm"

async function backfill() {
  console.log("Backfilling category_id from category string...")

  const allCategories = await db.select().from(categories)
  const slugMap = new Map(allCategories.map((c) => [c.slug, c.id]))

  const rows = await db
    .select({ id: products.id, category: products.category })
    .from(products)

  let updated = 0
  for (const row of rows) {
    const catId = slugMap.get(row.category)
    if (!catId) {
      console.log(`  Skipping ${row.id} — unknown category "${row.category}"`)
      continue
    }
    await db
      .update(products)
      .set({ categoryId: catId })
      .where(eq(products.id, row.id))
    updated++
  }

  console.log(`Updated ${updated} products`)
  console.log("Done!")
  process.exit(0)
}

backfill().catch((err) => {
  console.error(err)
  process.exit(1)
})
