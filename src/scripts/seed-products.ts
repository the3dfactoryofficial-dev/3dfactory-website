import { randomUUID } from "crypto"
import { db } from "@/db"
import { products, productImages } from "@/db/schema.pg"
import { staticProducts } from "@/data/products-static"

async function seed() {
  console.log("Seeding products into Turso...")

  for (let i = 0; i < staticProducts.length; i++) {
    const p = staticProducts[i]
    const id = p.id
    const now = new Date().toISOString()

    await db.insert(products).values({
      id,
      name: p.title,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      category: p.category,
      priceRange: p.priceRange ?? "",
      material: p.material ?? "",
      dimensions: p.dimensions ?? "",
      technologies: JSON.stringify(p.technologies ?? []),
      featuredImage: p.featuredImage,
      isFeatured: p.featured ?? false,
      isActive: true,
      supportsBulkOrders: p.supportsBulkOrders ?? false,
      customizable: p.customizable ?? false,
      printTime: p.printTime ?? "",
      finishType: p.finishType ?? "",
      productionType: p.productionType ?? "single",
      minimumOrderQuantity: p.minimumOrderQuantity ?? "",
      sortOrder: i + 1,
      createdAt: now,
      updatedAt: now,
    })

    if (p.galleryImages && p.galleryImages.length > 0) {
      await db.insert(productImages).values(
        p.galleryImages.map((url, i) => ({
          id: randomUUID(),
          productId: id,
          imageUrl: url,
          sortOrder: i,
          createdAt: now,
        }))
      )
    }

    console.log(`  ✓ ${p.title}`)
  }

  console.log(`\nSeeded ${staticProducts.length} products with gallery images.`)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
