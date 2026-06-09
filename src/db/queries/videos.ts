import { db } from "@/db"
import { productVideos } from "@/db/schema.pg"
import { eq, asc } from "drizzle-orm"
import { randomUUID } from "crypto"

export interface ProductVideo {
  id: string
  productId: string
  videoUrl: string
  thumbnailUrl: string
  sortOrder: number
}

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getProductVideosQuery(
  productId: string
): Promise<Result<ProductVideo[]>> {
  try {
    const rows = await db
      .select()
      .from(productVideos)
      .where(eq(productVideos.productId, productId))
      .orderBy(asc(productVideos.sortOrder))
    return { success: true, data: rows }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch videos",
    }
  }
}

export async function setProductVideosQuery(
  productId: string,
  videos: { videoUrl: string; thumbnailUrl?: string; sortOrder: number }[]
): Promise<Result<ProductVideo[]>> {
  try {
    await db.delete(productVideos).where(eq(productVideos.productId, productId))
    if (videos.length > 0) {
      const now = new Date().toISOString()
      await db.insert(productVideos).values(
        videos.map((v) => ({
          id: randomUUID(),
          productId,
          videoUrl: v.videoUrl,
          thumbnailUrl: v.thumbnailUrl ?? "",
          sortOrder: v.sortOrder,
          createdAt: now,
        }))
      )
    }
    return getProductVideosQuery(productId)
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save videos",
    }
  }
}
