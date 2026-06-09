import { isCloudinaryUrl, optimizeCloudinaryUrl } from "./cloudinary-url"

export function getBlurUrl(imageUrl: string): string | null {
  if (!imageUrl) return null
  if (isCloudinaryUrl(imageUrl)) {
    return optimizeCloudinaryUrl(imageUrl, {
      width: 20,
      quality: "low",
      crop: "scale",
      effects: ["e_blur:1000"],
    })
  }
  // For Supabase Storage URLs and local paths, no server-side blur available.
  // Next.js Image component handles optimization for these.
  return null
}

export function getBlurBackgroundStyle(imageUrl: string): Record<string, string> | undefined {
  const blurUrl = getBlurUrl(imageUrl)
  if (!blurUrl) return undefined
  return {
    backgroundImage: `url(${blurUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#18181b",
  }
}

export async function getBlurDataUrl(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null
  const blurUrl = getBlurUrl(imageUrl)
  if (!blurUrl) return null

  try {
    const res = await fetch(blurUrl)
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const mime = res.headers.get("content-type") ?? "image/jpeg"
    return `data:${mime};base64,${base64}`
  } catch {
    return null
  }
}