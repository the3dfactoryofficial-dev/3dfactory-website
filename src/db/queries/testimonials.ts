import { db } from "@/db"
import { testimonials } from "@/db/schema.pg"
import { eq, desc } from "drizzle-orm"
import { randomUUID } from "crypto"
import type {
  Testimonial,
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "@/lib/storage/testimonial-types"

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function toTestimonial(row: typeof testimonials.$inferSelect): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    content: row.content,
    rating: row.rating,
    imageUrl: row.imageUrl,
    productId: row.productId,
    featured: row.featured,
    createdAt: row.createdAt,
  }
}

export async function createTestimonialQuery(
  input: CreateTestimonialInput
): Promise<Result<Testimonial>> {
  try {
    const id = randomUUID()
    const now = new Date().toISOString()
    await db.insert(testimonials).values({
      id,
      name: input.name,
      role: input.role ?? "",
      company: input.company ?? "",
      content: input.content,
      rating: input.rating ?? 5,
      imageUrl: input.imageUrl ?? "",
      productId: input.productId ?? null,
      featured: input.featured ?? false,
      createdAt: now,
      updatedAt: now,
    })
    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id))
      .limit(1)
    return { success: true, data: toTestimonial(rows[0]) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create testimonial",
    }
  }
}

export async function updateTestimonialQuery(
  input: UpdateTestimonialInput
): Promise<Result<Testimonial>> {
  try {
    const now = new Date().toISOString()
    const { id, ...fields } = input
    await db
      .update(testimonials)
      .set({ ...fields, updatedAt: now })
      .where(eq(testimonials.id, id))
    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id))
      .limit(1)
    if (!rows[0]) return { success: false, error: "Testimonial not found" }
    return { success: true, data: toTestimonial(rows[0]) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update testimonial",
    }
  }
}

export async function deleteTestimonialQuery(
  id: string
): Promise<Result<void>> {
  try {
    await db.delete(testimonials).where(eq(testimonials.id, id))
    return { success: true, data: undefined }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete testimonial",
    }
  }
}

export async function getTestimonialsQuery(): Promise<Result<Testimonial[]>> {
  try {
    const rows = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt))
    return { success: true, data: rows.map(toTestimonial) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch testimonials",
    }
  }
}

export async function getFeaturedTestimonialsQuery(): Promise<
  Result<Testimonial[]>
> {
  try {
    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(desc(testimonials.createdAt))
    return { success: true, data: rows.map(toTestimonial) }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to fetch featured testimonials",
    }
  }
}
