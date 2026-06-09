"use server"

import { randomUUID } from "crypto"
import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/auth"
import { db } from "@/db"
import { categories } from "@/db/schema.pg"
import { eq } from "drizzle-orm"
import { CreateProductSchema, UpdateProductSchema, ToggleFeaturedSchema } from "@/lib/validation/product"
import {
  createProductQuery,
  updateProductQuery,
  deleteProductQuery,
  getProductsQuery,
  getFeaturedProductsQuery,
  getProductByIdQuery,
  moveProductQuery,
} from "@/db/queries/products"
import type { Product } from "@/types"
import { setProductVideosQuery, getProductVideosQuery } from "@/db/queries/videos"
import type { ProductVideo } from "@/db/queries/videos"
import { deleteMultipleFromStorage, extractStoragePath } from "@/lib/supabase-storage"

async function resolveCategoryFromId(
  raw: Record<string, unknown>
): Promise<void> {
  if (raw.categoryId && !raw.category) {
    const row = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, raw.categoryId as string))
      .limit(1)
      .then((r) => r[0])
    if (row) raw.category = row.slug
  }
}

function revalidateAll(slug?: string, oldSlug?: string) {
  revalidateTag("products", "max")
  revalidateTag("featured-products", "max")
  revalidatePath("/")
  revalidatePath("/catalog")
  revalidatePath("/admin/products")
  if (slug) revalidatePath(`/catalog/${slug}`)
  if (oldSlug && oldSlug !== slug) revalidatePath(`/catalog/${oldSlug}`)
}

export async function createProductAction(
  formData: FormData
): Promise<{ success: true; data: Product } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const raw: Record<string, unknown> = {}
    let videos: string[] = []
    formData.forEach((value, key) => {
      if (key === "technologies") {
        try { raw[key] = JSON.parse(value as string) } catch { raw[key] = (value as string).split(",").map((s: string) => s.trim()).filter(Boolean) }
      } else if (key === "galleryImages") {
        try { raw[key] = JSON.parse(value as string) } catch { raw[key] = (value as string).split("\n").map((s: string) => s.trim()).filter(Boolean) }
      } else if (key === "videos") {
        try { videos = JSON.parse(value as string) } catch { videos = [] }
      } else if (key === "isFeatured" || key === "isActive" || key === "supportsBulkOrders" || key === "customizable") {
        raw[key] = value === "true" || value === "on"
      } else if (key === "sortOrder") {
        raw[key] = parseInt(value as string, 10) || 999
      } else {
        raw[key] = value
      }
    })

    await resolveCategoryFromId(raw)
    const parsed = CreateProductSchema.parse(raw)
    const id = randomUUID()

    const result = await createProductQuery({
      id,
      ...parsed,
      technologies: JSON.stringify(parsed.technologies),
    })

    if (result.success) {
      revalidateAll(parsed.slug)
      if (videos.length > 0) {
        await setProductVideosQuery(
          id,
          videos.filter(Boolean).map((url, i) => ({ videoUrl: url, sortOrder: i }))
        )
      }
    }

    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product"
    if (err && typeof err === "object" && "issues" in err) {
      return { success: false, error: `Validation error: ${message}` }
    }
    return { success: false, error: message }
  }
}

export async function updateProductAction(
  formData: FormData
): Promise<{ success: true; data: Product } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const raw: Record<string, unknown> = {}
    let videos: string[] | undefined
    formData.forEach((value, key) => {
      if (key === "technologies") {
        try { raw[key] = JSON.parse(value as string) } catch { raw[key] = (value as string).split(",").map((s: string) => s.trim()).filter(Boolean) }
      } else if (key === "galleryImages") {
        try { raw[key] = JSON.parse(value as string) } catch { raw[key] = (value as string).split("\n").map((s: string) => s.trim()).filter(Boolean) }
      } else if (key === "videos") {
        try { videos = JSON.parse(value as string) } catch { videos = [] }
      } else if (key === "isFeatured" || key === "isActive" || key === "supportsBulkOrders" || key === "customizable") {
        raw[key] = value === "true" || value === "on"
      } else if (key === "sortOrder") {
        raw[key] = parseInt(value as string, 10) || 999
      } else {
        raw[key] = value
      }
    })

    await resolveCategoryFromId(raw)
    const parsed = UpdateProductSchema.parse(raw)
    if (!parsed.id) return { success: false, error: "Product ID is required" }

    const existing = await getProductByIdQuery(parsed.id)
    const oldSlug = existing.success ? existing.data?.slug : undefined

    const result = await updateProductQuery(parsed.id, {
      ...parsed,
      name: parsed.name,
      slug: parsed.slug,
      category: parsed.category,
      technologies: parsed.technologies ? JSON.stringify(parsed.technologies) : undefined,
    })

    if (result.success) {
      revalidateAll(parsed.slug, oldSlug)
      if (videos !== undefined) {
        await setProductVideosQuery(
          parsed.id,
          videos.filter(Boolean).map((url, i) => ({ videoUrl: url, sortOrder: i }))
        )
      }
    }
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product"
    if (err && typeof err === "object" && "issues" in err) {
      return { success: false, error: `Validation error: ${message}` }
    }
    return { success: false, error: message }
  }
}

export async function deleteProductAction(
  id: string,
  slug?: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const productResult = await getProductByIdQuery(id)
  if (productResult.success && productResult.data) {
    const paths: string[] = []
    const p = productResult.data as Product & { images?: { imageUrl: string }[] }

    if (p.featuredImage) {
      const fp = extractStoragePath(p.featuredImage)
      if (fp) paths.push(fp)
    }

    if (p.galleryImages && Array.isArray(p.galleryImages)) {
      for (const img of p.galleryImages) {
        const url = typeof img === "string" ? img : (img as { imageUrl: string }).imageUrl
        const sp = extractStoragePath(url)
        if (sp) paths.push(sp)
      }
    }

    const vidsResult = await getProductVideosQuery(id)
    if (vidsResult.success) {
      for (const v of vidsResult.data) {
        const vp = extractStoragePath(v.videoUrl)
        if (vp) paths.push(vp)
      }
    }

    if (paths.length > 0) {
      await deleteMultipleFromStorage(paths).catch(() => {})
    }
  }

  const result = await deleteProductQuery(id)
  if (result.success) {
    revalidateAll(slug)
  }
  return result
}

export async function toggleFeaturedAction(
  id: string,
  isFeatured: boolean,
  slug?: string
): Promise<{ success: true; data: Product } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const parsed = ToggleFeaturedSchema.parse({ id, isFeatured })
  const result = await updateProductQuery(parsed.id, { isFeatured: parsed.isFeatured })
  if (result.success) {
    revalidateAll(slug)
  }
  return result
}

export async function getProductsAction(): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  return getProductsQuery()
}

export async function getFeaturedProductsAction(): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  return getFeaturedProductsQuery()
}

export async function moveProductAction(
  productId: string,
  direction: "up" | "down"
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const result = await moveProductQuery(productId, direction)
  if (result.success) {
    revalidateAll()
  }
  return result
}

export async function getProductVideosAction(productId: string): Promise<
  { success: true; data: ProductVideo[] } | { success: false; error: string }
> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }
  return getProductVideosQuery(productId)
}
