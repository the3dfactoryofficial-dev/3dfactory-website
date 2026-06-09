"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/auth"
import { db } from "@/db"
import { testimonials } from "@/db/schema.pg"
import { eq } from "drizzle-orm"
import {
  createTestimonialQuery,
  updateTestimonialQuery,
  deleteTestimonialQuery,
  getTestimonialsQuery,
  getFeaturedTestimonialsQuery,
} from "@/db/queries/testimonials"
import { CreateTestimonialSchema, UpdateTestimonialSchema } from "@/lib/validation/testimonial"
import { deleteFromStorage, extractStoragePath } from "@/lib/supabase-storage"

function revalidateAll() {
  revalidateTag("testimonials", "max")
  revalidateTag("featured-testimonials", "max")
  revalidatePath("/")
  revalidatePath("/admin/testimonials")
}

export async function createTestimonialAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const raw = {
      name: formData.get("name") as string,
      role: (formData.get("role") as string) ?? "",
      company: (formData.get("company") as string) ?? "",
      content: formData.get("content") as string,
      rating: Number(formData.get("rating")) || 5,
      imageUrl: (formData.get("imageUrl") as string) ?? "",
      productId: (formData.get("productId") as string) || null,
      featured: formData.get("featured") === "true" || formData.get("featured") === "on",
    }

    const parsed = CreateTestimonialSchema.parse(raw)
    const result = await createTestimonialQuery(parsed)
    if (result.success) revalidateAll()
    return result
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      return { success: false as const, error: "Validation error" }
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to create testimonial",
    }
  }
}

export async function updateTestimonialAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      if (key === "rating") raw[key] = Number(value)
      else if (key === "featured") raw[key] = value === "true" || value === "on"
      else if (key === "productId") raw[key] = value || null
      else raw[key] = value
    }

    const parsed = UpdateTestimonialSchema.parse(raw)
    const result = await updateTestimonialQuery(parsed)
    if (result.success) revalidateAll()
    return result
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      return { success: false as const, error: "Validation error" }
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to update testimonial",
    }
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  try {
    const rows = await db.select({ imageUrl: testimonials.imageUrl }).from(testimonials).where(eq(testimonials.id, id)).limit(1)
    const oldImageUrl = rows[0]?.imageUrl
    if (oldImageUrl) {
      const storagePath = extractStoragePath(oldImageUrl)
      if (storagePath) {
        await deleteFromStorage(storagePath).catch(() => {})
      }
    }
  } catch {
    // Storage/file cleanup failure must not block DB deletion
  }

  const result = await deleteTestimonialQuery(id)
  if (result.success) revalidateAll()
  return result
}

export async function toggleFeaturedTestimonialAction(
  id: string,
  featured: boolean
) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const result = await updateTestimonialQuery({ id, featured })
  if (result.success) revalidateAll()
  return result
}

export async function getTestimonialsAction() {
  return getTestimonialsQuery()
}

export async function getFeaturedTestimonialsAction() {
  return getFeaturedTestimonialsQuery()
}
