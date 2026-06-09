import { db } from "@/db"
import { products, productImages, categories } from "@/db/schema.pg"
import { eq, desc, asc, and, or, lt, gt, inArray } from "drizzle-orm"
import { randomUUID } from "crypto"
import type { Product, ProductCategory } from "@/types"

export type ProductRow = typeof products.$inferSelect
export type ProductImageRow = typeof productImages.$inferSelect

export async function createProductQuery(input: {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  category: string
  categoryId?: string
  priceRange: string
  material: string
  dimensions: string
  technologies: string
  featuredImage: string
  isFeatured: boolean
  isActive: boolean
  supportsBulkOrders: boolean
  customizable: boolean
  printTime: string
  finishType: string
  productionType: string | null
  minimumOrderQuantity: string
  sortOrder: number
  galleryImages: string[]
}): Promise<{ success: true; data: Product } | { success: false; error: string }> {
  try {
    const now = new Date().toISOString()
    await db.insert(products).values({
      id: input.id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      shortDescription: input.shortDescription,
      category: input.category,
      categoryId: input.categoryId,
      priceRange: input.priceRange,
      material: input.material,
      dimensions: input.dimensions,
      technologies: input.technologies,
      featuredImage: input.featuredImage,
      isFeatured: input.isFeatured,
      isActive: input.isActive,
      supportsBulkOrders: input.supportsBulkOrders,
      customizable: input.customizable,
      printTime: input.printTime,
      finishType: input.finishType,
      productionType: input.productionType as "prototype" | "single" | "batch" | "custom" | null,
      minimumOrderQuantity: input.minimumOrderQuantity,
      sortOrder: input.sortOrder,
      createdAt: now,
      updatedAt: now,
    })

    if (input.galleryImages.length > 0) {
      await db.insert(productImages).values(
        input.galleryImages.map((url, i) => ({
          id: randomUUID(),
          productId: input.id,
          imageUrl: url,
          sortOrder: i,
          createdAt: now,
        }))
      )
    }

    const productData = await getProductWithImages(input.id) as Product
    return { success: true, data: productData }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create product",
    }
  }
}

export async function updateProductQuery(
  id: string,
  input: Partial<{
    name: string
    slug: string
    description: string
    shortDescription: string
    category: string
    categoryId?: string
    priceRange: string
    material: string
    dimensions: string
    technologies: string
    featuredImage: string
    isFeatured: boolean
    isActive: boolean
    supportsBulkOrders: boolean
    customizable: boolean
    printTime: string
    finishType: string
    productionType: string | null
    minimumOrderQuantity: string
    sortOrder: number
    galleryImages: string[]
  }>
): Promise<{ success: true; data: Product } | { success: false; error: string }> {
  try {
    const now = new Date().toISOString()
    const { galleryImages, productionType, category, ...fields } = input
    await db
      .update(products)
      .set({
        ...fields,
        category: category ?? undefined,
        productionType: productionType as
          | "prototype"
          | "single"
          | "batch"
          | "custom"
          | null
          | undefined,
        updatedAt: now,
      })
      .where(eq(products.id, id))

    if (galleryImages !== undefined) {
      await db.delete(productImages).where(eq(productImages.productId, id))
      if (galleryImages.length > 0) {
        await db.insert(productImages).values(
          galleryImages.map((url, i) => ({
            id: randomUUID(),
            productId: id,
            imageUrl: url,
            sortOrder: i,
            createdAt: now,
          }))
        )
      }
    }

    const afterUpdate = await getProductByIdQuery(id)
    if (!afterUpdate.success) return { success: false, error: "Product not found after update" }
    return { success: true, data: afterUpdate.data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update product",
    }
  }
}

export async function deleteProductQuery(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await db.delete(productImages).where(eq(productImages.productId, id))
    await db.delete(products).where(eq(products.id, id))
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete product",
    }
  }
}

async function getProductWithImages(id: string): Promise<{
  images: ProductImageRow[]
} & Product> {
  const row = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)
    .then((r) => r[0])

  const imgs = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder))

  return { ...mapRowToProduct(row, imgs), images: imgs }
}

function mapRowToProduct(
  row: ProductRow,
  imgs: ProductImageRow[]
): Product {
  return {
    id: row.id,
    title: row.name,
    slug: row.slug,
    category: row.category,
    categoryId: row.categoryId ?? undefined,
    description: row.description,
    shortDescription: row.shortDescription,
    featuredImage: row.featuredImage,
    galleryImages: imgs.map((i) => i.imageUrl),
    priceRange: row.priceRange || undefined,
    material: row.material || undefined,
    dimensions: row.dimensions || undefined,
    technologies: (() => { try { const p = JSON.parse(row.technologies); return Array.isArray(p) ? p : [] } catch { return [] } })(),
    featured: row.isFeatured,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    printTime: row.printTime || undefined,
    finishType: row.finishType || undefined,
    productionType: (row.productionType as Product["productionType"]) ?? undefined,
    supportsBulkOrders: row.supportsBulkOrders || undefined,
    customizable: row.customizable || undefined,
    minimumOrderQuantity: row.minimumOrderQuantity || undefined,
    createdAt: row.createdAt,
  }
}

export async function getProductsQuery(): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  try {
    const rows = await db
      .select()
      .from(products)
      .orderBy(asc(products.sortOrder), desc(products.createdAt))

    const productIds = rows.map((r) => r.id)
    const allImages = productIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.sortOrder))
      : []

    const imageMap = new Map<string, ProductImageRow[]>()
    for (const img of allImages) {
      const list = imageMap.get(img.productId) ?? []
      list.push(img)
      imageMap.set(img.productId, list)
    }

    return {
      success: true,
      data: rows.map((r) => mapRowToProduct(r, imageMap.get(r.id) ?? [])),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch products",
    }
  }
}

export async function getActiveProductsQuery(): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  try {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.sortOrder), desc(products.createdAt))

    const activeCategoryIds = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.isActive, true))
      .then((r) => new Set(r.map((c) => c.id)))

    const visible = rows.filter((p) => !p.categoryId || activeCategoryIds.has(p.categoryId))

    const activeIds = visible.map((r) => r.id)
    const allImages = activeIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, activeIds))
          .orderBy(asc(productImages.sortOrder))
      : []

    const imageMap = new Map<string, ProductImageRow[]>()
    for (const img of allImages) {
      const list = imageMap.get(img.productId) ?? []
      list.push(img)
      imageMap.set(img.productId, list)
    }

    return {
      success: true,
      data: visible.map((r) => mapRowToProduct(r, imageMap.get(r.id) ?? [])),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch products",
    }
  }
}

export async function getProductByIdQuery(
  id: string
): Promise<
  { success: true; data: Product } | { success: false; error: string }
> {
  try {
    const row = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .then((r) => r[0])
    if (!row) return { success: false, error: "Product not found" }
    const imgs = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder))
    return { success: true, data: mapRowToProduct(row, imgs) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch product",
    }
  }
}

export async function getProductBySlugQuery(
  slug: string
): Promise<
  { success: true; data: Product } | { success: false; error: string }
> {
  try {
    const row = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1)
      .then((r) => r[0])
    if (!row) return { success: false, error: "Product not found" }
    const imgs = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, row.id))
      .orderBy(asc(productImages.sortOrder))
    return { success: true, data: mapRowToProduct(row, imgs) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch product",
    }
  }
}

export async function getFeaturedProductsQuery(): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  try {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
      .orderBy(asc(products.sortOrder), desc(products.createdAt))

    const activeCategoryIds = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.isActive, true))
      .then((r) => new Set(r.map((c) => c.id)))

    const visible = rows.filter((p) => !p.categoryId || activeCategoryIds.has(p.categoryId))

    const featuredIds = visible.map((r) => r.id)
    const allImages = featuredIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, featuredIds))
          .orderBy(asc(productImages.sortOrder))
      : []

    const imageMap = new Map<string, ProductImageRow[]>()
    for (const img of allImages) {
      const list = imageMap.get(img.productId) ?? []
      list.push(img)
      imageMap.set(img.productId, list)
    }

    return {
      success: true,
      data: visible.map((r) => mapRowToProduct(r, imageMap.get(r.id) ?? [])),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch featured products",
    }
  }
}

export async function getProductsByCategoryQuery(
  categorySlugOrId: string
): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  try {
    const categoryRows = await db
      .select({ id: categories.id, isActive: categories.isActive })
      .from(categories)
      .where(eq(categories.slug, categorySlugOrId))
      .limit(1)

    const category = categoryRows[0]

    // If the category exists but is inactive, return empty
    if (category && !category.isActive) {
      return { success: true, data: [] }
    }

    const categoryId = category?.id

    const rows = await db
      .select()
      .from(products)
      .where(
        and(
          categoryId
            ? eq(products.categoryId, categoryId)
            : eq(products.category, categorySlugOrId),
          eq(products.isActive, true)
        )
      )
      .orderBy(asc(products.sortOrder), desc(products.createdAt))

    const productIds = rows.map((r) => r.id)
    const allImages = productIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.sortOrder))
      : []

    const imageMap = new Map<string, ProductImageRow[]>()
    for (const img of allImages) {
      const list = imageMap.get(img.productId) ?? []
      list.push(img)
      imageMap.set(img.productId, list)
    }

    return {
      success: true,
      data: rows.map((r) => mapRowToProduct(r, imageMap.get(r.id) ?? [])),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch products by category",
    }
  }
}

export async function moveProductQuery(
  productId: string,
  direction: "up" | "down"
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const current = await db
      .select({ id: products.id, sortOrder: products.sortOrder, createdAt: products.createdAt })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)
      .then((r) => r[0])

    if (!current) return { success: false, error: "Product not found" }

    const adjacent = direction === "up"
      ? await db
          .select({ id: products.id, sortOrder: products.sortOrder })
          .from(products)
          .where(
            or(
              lt(products.sortOrder, current.sortOrder),
              and(
                eq(products.sortOrder, current.sortOrder),
                gt(products.createdAt, current.createdAt)
              )
            )
          )
          .orderBy(desc(products.sortOrder), desc(products.createdAt))
          .limit(1)
          .then((r) => r[0])
      : await db
          .select({ id: products.id, sortOrder: products.sortOrder })
          .from(products)
          .where(
            or(
              gt(products.sortOrder, current.sortOrder),
              and(
                eq(products.sortOrder, current.sortOrder),
                lt(products.createdAt, current.createdAt)
              )
            )
          )
          .orderBy(asc(products.sortOrder), asc(products.createdAt))
          .limit(1)
          .then((r) => r[0])

    if (!adjacent) return { success: true }

    await db.transaction(async (tx) => {
      await tx.update(products).set({ sortOrder: adjacent.sortOrder }).where(eq(products.id, current.id))
      await tx.update(products).set({ sortOrder: current.sortOrder }).where(eq(products.id, adjacent.id))
    })

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to move product",
    }
  }
}
