"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { CreateInquirySchema, UpdateInquiryStatusSchema } from "@/lib/validation/inquiry"
import {
  createInquiryQuery,
  getInquiriesQuery,
  updateInquiryStatusQuery,
} from "@/db/queries/inquiries"
import type { InquiryResult, Inquiry } from "@/lib/storage"

function parseZodIssues(error: { message: string }): string {
  try {
    const issues = JSON.parse(error.message) as { message: string }[]
    return issues.map((e) => e.message).join("; ")
  } catch {
    return "Validation failed"
  }
}

export async function createInquiryAction(
  formData: FormData
): Promise<InquiryResult<Inquiry>> {
  // Honeypot check — if filled, silently reject
  if (formData.get("website")) {
    return { success: false, error: "Invalid submission" }
  }

  const rawAttachments = formData.get("attachments") as string | null
  let attachments: string[] = []
  if (rawAttachments) {
    try { const p = JSON.parse(rawAttachments); attachments = Array.isArray(p) ? p : [] } catch { attachments = [] }
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    product: formData.get("product") as string,
    category: formData.get("category") as string,
    quantity: Number(formData.get("quantity")),
    preferredSize: (formData.get("preferredSize") as string) ?? "",
    customizable: formData.get("customizable") === "true",
    message: (formData.get("message") as string) ?? "",
    sourcePage: formData.get("sourcePage") as string,
    source: formData.get("source") as string ?? "unknown",
    attachments,
  }

  const parsed = CreateInquirySchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parseZodIssues(parsed.error),
    }
  }

  return createInquiryQuery(parsed.data)
}

export async function getInquiriesAction(): Promise<InquiryResult<Inquiry[]>> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  return getInquiriesQuery()
}

export async function updateInquiryStatusAction(
  formData: FormData
): Promise<InquiryResult<Inquiry>> {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized" }
  }

  const raw = {
    id: formData.get("id") as string,
    status: formData.get("status") as string,
  }

  const parsed = UpdateInquiryStatusSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parseZodIssues(parsed.error),
    }
  }

  const result = await updateInquiryStatusQuery(parsed.data)
  if (result.success) {
    revalidatePath("/admin/inquiries")
  }
  return result
}
