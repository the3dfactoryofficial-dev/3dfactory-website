"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import { getActiveCategoriesAction } from "@/actions/categories"
import type { Product } from "@/types"
import { cn, generateWhatsAppProductMessage, getWhatsAppUrl } from "@/lib/utils"
import { SITE } from "@/lib/constants"
import { siteUrl } from "@/lib/url"
import { trackWhatsAppClick } from "@/lib/analytics"
import { optimizeImage } from "@/lib/cloudinary-utils"
import { QuickInquiry } from "@/components/catalog/QuickInquiry"

const AUTOPLAY_INTERVAL = 4500
const RESUME_DELAY = 5000

function scrollToIndex(container: HTMLDivElement, index: number) {
  const slide = container.querySelector<HTMLElement>(`[data-index="${index}"]`)
  if (!slide) return
  container.scrollTo({
    left: slide.offsetLeft,
    behavior: "smooth",
  })
}

export function FeaturedGallery({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [slugMap, setSlugMap] = useState<Record<string, string>>({})
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null)
  const mountedRef = useRef(true)

  const handleWhatsAppClick = (product: Product) => {
    const productUrl = siteUrl(`/catalog/${product.slug}`)
    const message = generateWhatsAppProductMessage({
      productName: product.title,
      priceRange: product.priceRange,
      categoryName: slugMap[product.category] ?? product.category,
      productImage: product.featuredImage,
      productUrl,
    })
    const url = getWhatsAppUrl(SITE.whatsapp, message)
    window.open(url, "_blank")
    trackWhatsAppClick("featured_gallery", product.id, product.title)
  }
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isVisible = useRef(true)
  const reduceMotion = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    getActiveCategoriesAction().then((result) => {
      if (!mountedRef.current) return
      if (result.success) {
        const map: Record<string, string> = {}
        for (const c of result.data) {
          map[c.slug] = c.name
        }
        setSlugMap(map)
      }
    })
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    const el = galleryRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const getActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container) return 0

    const containerRect = container.getBoundingClientRect()
    const center = containerRect.left + containerRect.width / 2
    const slides = container.querySelectorAll<HTMLElement>("[data-slide]")

    let closest = 0
    let minDist = Infinity

    for (const slide of slides) {
      const rect = slide.getBoundingClientRect()
      const slideCenter = rect.left + rect.width / 2
      const dist = Math.abs(center - slideCenter)
      if (dist < minDist) {
        minDist = dist
        const idx = Number(slide.getAttribute("data-index"))
        if (!isNaN(idx)) closest = idx
      }
    }

    return closest
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setActiveIndex(getActiveIndex())
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener("scroll", onScroll, { passive: true })
    return () => container.removeEventListener("scroll", onScroll)
  }, [getActiveIndex])

  useEffect(() => {
    if (isPaused || reduceMotion.current || products.length <= 1) return

    const interval = setInterval(() => {
      if (!isVisible.current) return
      const next = (getActiveIndex() + 1) % products.length
      const container = scrollRef.current
      if (container) scrollToIndex(container, next)
    }, AUTOPLAY_INTERVAL)

    return () => clearInterval(interval)
  }, [isPaused, products.length, getActiveIndex])

  const pause = useCallback(() => {
    setIsPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }, [])

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setIsPaused(false), RESUME_DELAY)
  }, [])

  const scrollTo = useCallback((index: number) => {
    pause()
    const container = scrollRef.current
    if (container) scrollToIndex(container, index)
    scheduleResume()
  }, [pause, scheduleResume])

  const goNext = useCallback(() => {
    scrollTo((getActiveIndex() + 1) % products.length)
  }, [scrollTo, getActiveIndex, products.length])

  const goPrev = useCallback(() => {
    scrollTo((getActiveIndex() - 1 + products.length) % products.length)
  }, [scrollTo, getActiveIndex, products.length])

  if (!products.length) return null

  return (
    <div
      ref={galleryRef}
      onMouseEnter={pause}
      onMouseLeave={scheduleResume}
      onTouchStart={pause}
      onTouchEnd={scheduleResume}
    >
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 gap-4 md:gap-6 pb-2",
          "overscroll-x-contain"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            data-slide
            data-index={index}
            className={cn(
              "snap-center shrink-0 w-[80vw] sm:w-[60vw] lg:w-[45vw] max-w-lg",
              "transition-all duration-500",
              index === activeIndex
                ? "opacity-100 scale-100"
                : "opacity-50 scale-[0.95] sm:opacity-60"
            )}
          >
            <Link
              href={`/catalog/${product.slug}`}
              className="group block relative aspect-[4/5] rounded-xl overflow-hidden bg-surface"
            >
              <Image
                src={optimizeImage(product.featuredImage, 800)}
                alt={product.title}
                fill
                className={cn(
                  "object-cover transition-transform duration-500 group-hover:scale-105",
                  index === activeIndex ? "brightness-100" : "brightness-75"
                )}
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 60vw, 45vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground border border-border/50">
                  {slugMap[product.category] ?? product.category}
                </span>
              </div>

              {index === activeIndex && (
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/20 pointer-events-none" />
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className="text-base md:text-lg font-bold text-white drop-shadow-sm">
                  {product.title}
                </h3>
                {product.shortDescription && (
                  <p className="mt-1 text-xs md:text-sm text-white/70 line-clamp-1 leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
                {product.priceRange && (
                  <p className="mt-1 text-xs md:text-sm font-medium text-amber-400">
                    From {product.priceRange}
                  </p>
                )}
                <div className="mt-2 flex gap-1.5" onClick={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleWhatsAppClick(product)
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-medium rounded-md bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97] transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Order Now</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setInquiryProduct(product)
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-medium rounded-md bg-white/15 text-white hover:bg-white/25 active:scale-[0.97] backdrop-blur-sm transition-all cursor-pointer"
                  >
                    Custom Quote
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {products.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="hidden md:inline-flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 active:scale-[0.96] transition-all z-10"
            aria-label="Previous featured product"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goNext}
            className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 active:scale-[0.96] transition-all z-10"
            aria-label="Next featured product"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2 mt-6" role="tablist" aria-label="Featured products">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Go to product ${index + 1}`}
                className={cn(
                  "rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  index === activeIndex
                    ? "w-8 h-2 bg-primary"
                    : "w-2 h-2 bg-zinc-600 hover:bg-zinc-500"
                )}
              />
            ))}
          </div>
        </>
      )}

      {inquiryProduct && (
        <QuickInquiry
          productName={inquiryProduct.title}
          productCategory={slugMap[inquiryProduct.category] ?? inquiryProduct.category}
          sourcePage={inquiryProduct.slug}
          source="featured_gallery"
          onClose={() => setInquiryProduct(null)}
        />
      )}
    </div>
  )
}
