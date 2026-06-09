import { db } from "@/db"
import { inquiries } from "@/db/schema.pg"
import { eq, desc } from "drizzle-orm"
import { randomUUID } from "crypto"
import type {
  Inquiry,
  CreateInquiryInput,
  UpdateStatusInput,
  InquiryResult,
} from "@/lib/storage/types"

function toInquiry(row: typeof inquiries.$inferSelect): Inquiry {
  let attachments: string[] | undefined
  try { const p = JSON.parse(row.attachments); attachments = Array.isArray(p) ? p : undefined } catch { attachments = undefined }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    product: row.product,
    category: row.category,
    quantity: row.quantity,
    preferredSize: row.preferredSize,
    customizable: row.customizable,
    message: row.message,
    sourcePage: row.sourcePage,
    source: row.source,
    attachments,
    status: row.status,
    userId: row.userId,
    createdAt: row.createdAt,
  }
}

export async function createInquiryQuery(
  input: CreateInquiryInput
): Promise<InquiryResult<Inquiry>> {
  try {
    const id = randomUUID()
    const now = new Date().toISOString()
    await db
      .insert(inquiries)
      .values({
        id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        product: input.product,
        category: input.category,
        quantity: input.quantity,
        preferredSize: input.preferredSize ?? "",
        customizable: input.customizable,
        message: input.message ?? "",
        sourcePage: input.sourcePage,
        source: input.source ?? "unknown",
        attachments: JSON.stringify(input.attachments ?? []),
        status: "new",
        createdAt: now,
      })
    return { success: true, data: toInquiry({ id, ...input, source: input.source ?? "unknown", preferredSize: input.preferredSize ?? "", message: input.message ?? "", attachments: JSON.stringify(input.attachments ?? []), status: "new" as const, userId: null, createdAt: now }) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create inquiry",
    }
  }
}

export async function getInquiriesQuery(): Promise<
  InquiryResult<Inquiry[]>
> {
  try {
    const rows = await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt))
    return { success: true, data: rows.map(toInquiry) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch inquiries",
    }
  }
}

export async function getInquiryByIdQuery(
  id: string
): Promise<InquiryResult<Inquiry>> {
  try {
    const rows = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id))
      .limit(1)
    const row = rows[0]
    if (!row) return { success: false, error: "Inquiry not found" }
    return { success: true, data: toInquiry(row) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch inquiry",
    }
  }
}

export async function updateInquiryStatusQuery(
  input: UpdateStatusInput
): Promise<InquiryResult<Inquiry>> {
  try {
    await db
      .update(inquiries)
      .set({ status: input.status })
      .where(eq(inquiries.id, input.id))
    const rows = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, input.id))
      .limit(1)
    const updated = rows[0]
    if (!updated) return { success: false, error: "Inquiry not found" }
    return { success: true, data: toInquiry(updated) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update inquiry",
    }
  }
}
