import { db } from "@/db"
import { categories } from "@/db/schema.pg"
import { eq, asc, sql } from "drizzle-orm"
import { randomUUID } from "crypto"

export type CategoryRow = typeof categories.$inferSelect

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

const CATEGORY_ORDER = [asc(categories.sortOrder), asc(categories.createdAt)]

async function normalizeSortOrder(): Promise<void> {
  const all = await db
    .select({ id: categories.id })
    .from(categories)
    .orderBy(...CATEGORY_ORDER)

  if (all.length === 0) return

  await db.transaction(async (tx) => {
    for (let i = 0; i < all.length; i++) {
      await tx
        .update(categories)
        .set({ sortOrder: i })
        .where(eq(categories.id, all[i].id))
    }
  })
}

async function getCategoriesQuery(): Promise<Result<CategoryRow[]>> {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(...CATEGORY_ORDER)
    return { success: true, data: rows }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch categories",
    }
  }
}

async function getActiveCategoriesQuery(): Promise<Result<CategoryRow[]>> {
  try {
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(...CATEGORY_ORDER)
    return { success: true, data: rows }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch active categories",
    }
  }
}

async function getCategoryBySlugQuery(slug: string): Promise<Result<CategoryRow>> {
  try {
    const row = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)
      .then((r) => r[0])
    if (!row) return { success: false, error: "Category not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch category",
    }
  }
}

async function getCategoryByIdQuery(id: string): Promise<Result<CategoryRow>> {
  try {
    const row = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then((r) => r[0])
    if (!row) return { success: false, error: "Category not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch category",
    }
  }
}

async function createCategoryQuery(input: {
  name: string
  slug: string
  description: string
  sortOrder: number
  isActive: boolean
}): Promise<Result<CategoryRow>> {
  try {
    const maxResult = await db
      .select({ maxSort: sql<number>`coalesce(max(${categories.sortOrder}), -1) + 1` })
      .from(categories)
      .then((r) => r[0])

    const id = randomUUID()
    const now = new Date().toISOString()
    const sortOrder = maxResult?.maxSort ?? 0
    await db.insert(categories).values({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      sortOrder,
      isActive: input.isActive,
      createdAt: now,
    })
    const row = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then((r) => r[0])
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create category",
    }
  }
}

async function updateCategoryQuery(
  id: string,
  input: Partial<{
    name: string
    slug: string
    description: string
    sortOrder: number
    isActive: boolean
  }>
): Promise<Result<CategoryRow>> {
  try {
    await db
      .update(categories)
      .set(input)
      .where(eq(categories.id, id))

    const row = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then((r) => r[0])
    if (!row) return { success: false, error: "Category not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update category",
    }
  }
}

async function deleteCategoryQuery(id: string): Promise<Result<void>> {
  try {
    await db.delete(categories).where(eq(categories.id, id))
    await normalizeSortOrder()
    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete category",
    }
  }
}

async function toggleCategoryActiveQuery(id: string, current: boolean): Promise<Result<CategoryRow>> {
  return updateCategoryQuery(id, { isActive: !current })
}

async function moveCategoryQuery(
  id: string,
  direction: "up" | "down"
): Promise<Result<void>> {
  try {
    const all = await db
      .select()
      .from(categories)
      .orderBy(...CATEGORY_ORDER)

    const idx = all.findIndex((c) => c.id === id)
    if (idx === -1) return { success: false, error: "Category not found" }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= all.length) return { success: true, data: undefined }

    await db.transaction(async (tx) => {
      await tx
        .update(categories)
        .set({ sortOrder: all[swapIdx].sortOrder })
        .where(eq(categories.id, all[idx].id))
      await tx
        .update(categories)
        .set({ sortOrder: all[idx].sortOrder })
        .where(eq(categories.id, all[swapIdx].id))
    })

    await normalizeSortOrder()
    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to move category",
    }
  }
}

export {
  getCategoriesQuery,
  getActiveCategoriesQuery,
  getCategoryBySlugQuery,
  getCategoryByIdQuery,
  createCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
  toggleCategoryActiveQuery,
  moveCategoryQuery,
}