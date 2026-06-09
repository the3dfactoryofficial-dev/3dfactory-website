import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

const BUCKET = "media"

let _adminClient: ReturnType<typeof createClient> | null = null

function getAdminClient() {
  if (!_adminClient) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars")
    }
    _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _adminClient
}

export function getPublicUrl(path: string): string {
  if (!path) return ""
  if (isFullUrl(path)) return path
  if (!SUPABASE_URL) return path
  const urlBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
  return `${urlBase}/${path}`
}

function isFullUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://")
}

export function isStoragePath(value: string): boolean {
  if (!value) return false
  if (isFullUrl(value)) return false
  return value.includes("/") && !value.startsWith("/")
}

const STORAGE_URL_PREFIX = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
  : null

export function extractStoragePath(publicUrl: string): string | null {
  if (!publicUrl || !STORAGE_URL_PREFIX) return null
  if (publicUrl.startsWith(STORAGE_URL_PREFIX)) {
    return decodeURIComponent(publicUrl.slice(STORAGE_URL_PREFIX.length))
  }
  return null
}

export async function uploadToStorage(
  file: File | Blob,
  path: string,
  options?: { contentType?: string; upsert?: boolean; signal?: AbortSignal }
): Promise<{ path: string; publicUrl: string }> {
  const client = getAdminClient()
  const contentType = options?.contentType ?? (file instanceof File ? file.type : "application/octet-stream")

  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType,
      upsert: options?.upsert ?? true,
      ...(options?.signal ? { signal: options.signal } : {}),
    })

  if (error) {
    if (error.message?.includes("abort") || error.message?.includes("timeout")) {
      throw new Error("Upload was cancelled or timed out")
    }
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const publicUrl = getPublicUrl(path)
  return { path, publicUrl }
}

export async function deleteFromStorage(path: string): Promise<void> {
  const client = getAdminClient()
  const { error } = await client.storage.from(BUCKET).remove([path])
  if (error) {
    console.error(`Failed to delete ${path}:`, error.message)
  }
}

export async function deleteMultipleFromStorage(paths: string[]): Promise<void> {
  const valid = paths.filter(Boolean)
  if (valid.length === 0) return
  const client = getAdminClient()
  const { error } = await client.storage.from(BUCKET).remove(valid)
  if (error) {
    console.error(`Bulk delete failed:`, error.message)
  }
}

export function buildStoragePath(folder: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg"
  const safeName = filename
    .replace(/^.*[/\\]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${folder}/${timestamp}-${random}.${ext}`
}

export const STORAGE_LIMITS = {
  imageMaxMB: 5,
  videoMaxMB: 100,
  imageTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"],
  videoTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
} as const

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!STORAGE_LIMITS.imageTypes.includes(file.type as typeof STORAGE_LIMITS.imageTypes[number])) {
    return { valid: false, error: `Invalid image type "${file.type}". Allowed: JPEG, PNG, WebP, AVIF` }
  }
  if (file.size > STORAGE_LIMITS.imageMaxMB * 1024 * 1024) {
    return { valid: false, error: `Image too large (max ${STORAGE_LIMITS.imageMaxMB}MB)` }
  }
  return { valid: true }
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!STORAGE_LIMITS.videoTypes.includes(file.type as typeof STORAGE_LIMITS.videoTypes[number])) {
    return { valid: false, error: `Invalid video type "${file.type}". Allowed: MP4, WebM, MOV` }
  }
  if (file.size > STORAGE_LIMITS.videoMaxMB * 1024 * 1024) {
    return { valid: false, error: `Video too large (max ${STORAGE_LIMITS.videoMaxMB}MB)` }
  }
  return { valid: true }
}