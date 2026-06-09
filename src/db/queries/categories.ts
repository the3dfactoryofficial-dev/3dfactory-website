import { db } from "@/db"
import { categories } from "@/db/schema.pg"
import { eq, asc, desc, or, lt, gt, and } from "drizzle-orm"
import { randomUUID } from "crypto"

export type CategoryRow = typeof categories.$inferSelect

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

async function getCategoriesQuery(): Promise<Result<CategoryRow[]>> {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder))
    console.log("[GET CATEGORIES]", rows.map((r) => ({ id: r.id.slice(0, 8), name: r.name, isActive: r.isActive, sortOrder: r.sortOrder })))
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
      .orderBy(asc(categories.sortOrder))
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
    const id = randomUUID()
    const now = new Date().toISOString()
    await db.insert(categories).values({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      sortOrder: input.sortOrder,
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
    console.log("[CATEGORY UPDATE]", { id, input })
    const before = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)
    console.log("[CATEGORY UPDATE] BEFORE:", { id: before?.id, isActive: before?.isActive, sortOrder: before?.sortOrder })

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
    console.log("[CATEGORY UPDATE] AFTER:", { id: row?.id, isActive: row?.isActive, sortOrder: row?.sortOrder })
    if (!row) return { success: false, error: "Category not found" }
    return { success: true, data: row }
  } catch (err) {
    console.error("[CATEGORY UPDATE] ERROR:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update category",
    }
  }
}

async function deleteCategoryQuery(id: string): Promise<Result<void>> {
  try {
    await db.delete(categories).where(eq(categories.id, id))
    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete category",
    }
  }
}

async function toggleCategoryActiveQuery(id: string, current: boolean): Promise<Result<CategoryRow>> {
  console.log("[TOGGLE] id:", id, "current:", current, "→ setting:", !current)
  return updateCategoryQuery(id, { isActive: !current })
}

async function moveCategoryQuery(
  id: string,
  direction: "up" | "down"
): Promise<Result<void>> {
  try {
    const current = await db
      .select({ id: categories.id, sortOrder: categories.sortOrder })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then((r) => r[0])

    if (!current) return { success: false, error: "Category not found" }

    const adjacent = direction === "up"
      ? await db
          .select({ id: categories.id, sortOrder: categories.sortOrder })
          .from(categories)
          .where(lt(categories.sortOrder, current.sortOrder))
          .orderBy(desc(categories.sortOrder))
          .limit(1)
          .then((r) => r[0])
      : await db
          .select({ id: categories.id, sortOrder: categories.sortOrder })
          .from(categories)
          .where(gt(categories.sortOrder, current.sortOrder))
          .orderBy(asc(categories.sortOrder))
          .limit(1)
          .then((r) => r[0])

    if (!adjacent) return { success: true, data: undefined }

    await db.transaction(async (tx) => {
      await tx.update(categories).set({ sortOrder: adjacent.sortOrder }).where(eq(categories.id, current.id))
      await tx.update(categories).set({ sortOrder: current.sortOrder }).where(eq(categories.id, adjacent.id))
    })

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
