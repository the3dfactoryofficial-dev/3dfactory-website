import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadToStorage, validateImageFile, validateVideoFile, buildStoragePath } from "@/lib/supabase-storage"

const VALID_FOLDERS = [
  "products",
  "products/gallery",
  "testimonials",
  "videos",
  "inquiries",
] as const

type MediaType = "image" | "video"

const UPLOAD_TIMEOUT_MS = 120_000

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = formData.get("folder") as string | null
    const mediaType = (formData.get("mediaType") as MediaType) || "image"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!folder || !VALID_FOLDERS.includes(folder as typeof VALID_FOLDERS[number])) {
      return NextResponse.json({ error: `Invalid folder. Allowed: ${VALID_FOLDERS.join(", ")}` }, { status: 400 })
    }

    if (mediaType === "image") {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    } else if (mediaType === "video") {
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    const path = buildStoragePath(folder, file.name)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS)

    request.signal.addEventListener("abort", () => {
      controller.abort()
      clearTimeout(timeoutId)
    })

    try {
      const result = await uploadToStorage(file, path, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return NextResponse.json({ path: result.path, publicUrl: result.publicUrl })
    } catch (err) {
      clearTimeout(timeoutId)
      throw err
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    if (message.includes("abort") || message.includes("cancelled") || message.includes("timeout")) {
      return NextResponse.json({ error: "Upload timed out or was cancelled" }, { status: 499 })
    }
    console.error("[Upload API]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}