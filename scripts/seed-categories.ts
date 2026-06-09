import { db } from "@/db"
import { categories } from "@/db/schema.pg"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

const SEED_CATEGORIES = [
  { slug: "spiritual-decor", name: "Spiritual Decor", sortOrder: 0 },
  { slug: "cosplay",         name: "Cosplay & Props",   sortOrder: 1 },
  { slug: "custom",          name: "Custom Orders",     sortOrder: 2 },
  { slug: "prototypes",      name: "Prototypes",        sortOrder: 3 },
]

async function main() {
  console.log("Seeding categories...")
  for (const cat of SEED_CATEGORIES) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1)
      .then((r) => r[0])
    if (existing) {
      console.log(`  Skipping ${cat.slug} (already exists)`)
      continue
    }
    await db.insert(categories).values({
      id: randomUUID(),
      name: cat.name,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
    })
    console.log(`  Created ${cat.slug}`)
  }
  console.log("Done!")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
