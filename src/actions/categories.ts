"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/auth"
import { CreateCategorySchema, UpdateCategorySchema } from "@/lib/validation/category"
import {
  getCategoriesQuery,
  getActiveCategoriesQuery,
  createCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
  toggleCategoryActiveQuery,
  reorderCategoriesQuery,
} from "@/db/queries/categories"
import type { CategoryRow } from "@/db/queries/categories"

function revalidateAll() {
  revalidateTag("categories", "max")
  revalidatePath("/admin/categories")
  revalidatePath("/catalog")
}

export async function getCategoriesAction() {
  return getCategoriesQuery()
}

export async function getActiveCategoriesAction() {
  return getActiveCategoriesQuery()
}

export async function createCategoryAction(
  formData: FormData
): Promise<{ success: true; data: CategoryRow } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (key === "sortOrder") {
        raw[key] = parseInt(value as string, 10) || 0
      } else if (key === "isActive") {
        raw[key] = value === "true" || value === "on"
      } else {
        raw[key] = value
      }
    })

    const parsed = CreateCategorySchema.parse(raw)
    parsed.isActive = true
    const result = await createCategoryQuery(parsed)
    if (result.success) revalidateAll()
    return result
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      return { success: false, error: "Validation error" }
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create category",
    }
  }
}

export async function updateCategoryAction(
  formData: FormData
): Promise<{ success: true; data: CategoryRow } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (key === "sortOrder") {
        raw[key] = parseInt(value as string, 10) || 0
      } else if (key === "isActive") {
        raw[key] = value === "true" || value === "on"
      } else {
        raw[key] = value
      }
    })

    const parsed = UpdateCategorySchema.parse(raw)
    if (!parsed.id) return { success: false, error: "Category ID is required" }

    const { id, ...fields } = parsed
    const result = await updateCategoryQuery(id, fields)
    if (result.success) revalidateAll()
    return result
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      return { success: false, error: "Validation error" }
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update category",
    }
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const result = await deleteCategoryQuery(id)
  if (result.success) revalidateAll()
  return result
}

export async function toggleCategoryActiveAction(
  id: string,
  current: boolean
): Promise<{ success: true; data: CategoryRow } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const result = await toggleCategoryActiveQuery(id, current)
  if (result.success) revalidateAll()
  return result
}

export async function reorderCategoriesAction(
  categoryIdsInOrder: string[]
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const result = await reorderCategoriesQuery(categoryIdsInOrder)
  if (result.success) revalidateAll()
  return result
}
