"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Image from "next/image"
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { getActiveCategoriesAction } from "@/actions/categories"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"
import { QuickInquiry } from "./QuickInquiry"
import { optimizeImage, optimizeThumbnail, getBlurBackgroundStyle } from "@/lib/cloudinary-utils"
import { lockBodyScroll, unlockBodyScroll } from "@/lib/ui/scroll-lock"

interface ProductGalleryProps {
  product: Product
  onClose: () => void
}

export function ProductGallery({ product, onClose }: ProductGalleryProps) {
  const allImages = [
    product.featuredImage,
    ...(product.galleryImages ?? []),
  ].filter(Boolean)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const [slugMap, setSlugMap] = useState<Record<string, string>>({})
  const [showInquiry, setShowInquiry] = useState(false)

  useEffect(() => {
    getActiveCategoriesAction().then((result) => {
      if (result.success) {
        const map: Record<string, string> = {}
        for (const c of result.data) {
          map[c.slug] = c.name
        }
        setSlugMap(map)
      }
    })
  }, [])

  const categoryLabel = slugMap[product.category] ?? product.category

  const goTo = useCallback(
    (index: number) => {
      if (index < 0) setCurrentIndex(allImages.length - 1)
      else if (index >= allImages.length) setCurrentIndex(0)
      else setCurrentIndex(index)
    },
    [allImages.length]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (fullscreen) setFullscreen(false)
          else onClose()
          break
        case "ArrowLeft":
          goTo(currentIndex - 1)
          break
        case "ArrowRight":
          goTo(currentIndex + 1)
          break
      }
    },
    [currentIndex, fullscreen, onClose, goTo]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    lockBodyScroll()
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      unlockBodyScroll()
    }
  }, [handleKeyDown])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) {
      goTo(currentIndex + (diff < 0 ? 1 : -1))
    }
    setTouchStart(null)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !fullscreen) {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/75 backdrop-blur-sm p-4 md:p-8"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "relative w-full max-w-5xl rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300",
          fullscreen ? "max-w-none h-full rounded-none border-0" : "max-h-[90vh]"
        )}
      >
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white active:scale-90 transition-all duration-200 backdrop-blur-sm"
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {fullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white active:scale-90 transition-all duration-200 backdrop-blur-sm"
              aria-label="Close gallery"
            >
              <X className="w-4 h-4" />
            </button>
        </div>

        <div
          className={cn(
            "relative overflow-hidden bg-background",
            fullscreen ? "h-full" : "aspect-[4/3] md:aspect-[16/9]"
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {allImages.map((src, i) => (
            <div
              key={src}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                i === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              style={getBlurBackgroundStyle(src)}
            >
              <Image
                src={optimizeImage(src, 1200)}
                alt={`${product.title} — Image ${i + 1}`}
                fill
                className={cn(
                  "transition-opacity duration-500",
                  fullscreen ? "object-contain" : "object-cover"
                )}
                sizes="(max-width: 768px) 100vw, 80vw"
                priority={i === 0}
              />
            </div>
          ))}

          {allImages.length > 1 && (
            <>
              <button
                onClick={() => goTo(currentIndex - 1)}
                className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-90 transition-all duration-200 backdrop-blur-sm z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-90 transition-all duration-200 backdrop-blur-sm z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === currentIndex
                        ? "bg-white w-6"
                        : "bg-white/40 hover:bg-white/60 active:scale-90"
                    )}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {!fullscreen && (
          <div className="p-5 md:p-6 overflow-y-auto max-h-[40vh] md:max-h-[50vh]">
            {allImages.length > 1 && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      i === currentIndex
                        ? "border-primary opacity-100"
                        : "border-transparent opacity-80 md:opacity-60 hover:opacity-100 active:opacity-100"
                    )}
                  >
                    <Image
                      src={optimizeThumbnail(src)}
                      alt={`${product.title} thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-primary/10 text-primary border border-primary/20 mb-3">
                  {categoryLabel}
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  {product.title}
                </h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {product.description}
                </p>

                {product.priceRange && (
                  <p className="mt-3 text-sm font-medium text-foreground">
                    From{" "}
                    <span className="text-primary">{product.priceRange}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {product.material && (
                  <div>
                    <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                      Material
                    </p>
                    <p className="text-sm text-foreground">
                      {product.material}
                    </p>
                  </div>
                )}

                {product.technologies && product.technologies.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                      Technology
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-800 text-muted-foreground border border-border/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.dimensions && (
                  <div>
                    <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                      Dimensions
                    </p>
                    <p className="text-sm text-foreground">
                      {product.dimensions}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Want something similar? We build custom projects —
                    send us your requirements.
                  </p>
                  <button
                    onClick={() => setShowInquiry(true)}
                    className="inline-flex items-center justify-center gap-2 w-full h-11 px-6 text-sm font-medium rounded-xl bg-[#25D366] text-white hover:bg-[#20BD5A] transition-all duration-200 shadow-lg shadow-[#25D366]/20 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire About This Product</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showInquiry && (
        <QuickInquiry
          productName={product.title}
          productCategory={categoryLabel}
          sourcePage={product.slug}
          source="product_page"
          onClose={() => setShowInquiry(false)}
        />
      )}
    </div>
  )
}
