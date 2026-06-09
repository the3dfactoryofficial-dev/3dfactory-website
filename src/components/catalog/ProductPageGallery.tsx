"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { optimizeImage, optimizeThumbnail, getBlurBackgroundStyle } from "@/lib/cloudinary-utils"

interface ProductPageGalleryProps {
  images: string[]
  title: string
}

export function ProductPageGallery({ images, title }: ProductPageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goTo = (index: number) => {
    if (index < 0) setCurrentIndex(images.length - 1)
    else if (index >= images.length) setCurrentIndex(0)
    else setCurrentIndex(index)
  }

  if (images.length === 0) return null

  return (
    <div className="lg:sticky lg:top-24">
      <div
        className="relative aspect-[4/3] lg:aspect-square rounded-xl overflow-hidden bg-surface border border-border shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
        style={getBlurBackgroundStyle(images[currentIndex])}
      >
        <Image
          src={optimizeImage(images[currentIndex], 1200)}
          alt={`${title} — Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-90 transition-all duration-200 backdrop-blur-sm z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-90 transition-all duration-200 backdrop-blur-sm z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={`Go to image ${i + 1}`}
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-300",
                      i === currentIndex
                        ? "bg-white w-6 h-2"
                        : "bg-white/40 hover:bg-white/60 w-2 h-2"
                    )}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                  "relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200",
                  i === currentIndex
                    ? "border-primary opacity-100 ring-1 ring-primary/30"
                    : "border-border/50 opacity-60 hover:opacity-100 active:opacity-100 active:scale-95"
              )}
            >
              <Image
                src={optimizeThumbnail(src)}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
