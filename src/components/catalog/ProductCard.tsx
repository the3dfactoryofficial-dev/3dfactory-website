"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Sparkles, Clock } from "lucide-react"
import type { Product } from "@/types"
import { Card } from "@/components/ui/Card"
import { cn, generateWhatsAppProductMessage, getWhatsAppUrl } from "@/lib/utils"
import { SITE } from "@/lib/constants"
import { siteUrl } from "@/lib/url"
import { trackWhatsAppClick } from "@/lib/analytics"
import { optimizeImage, getBlurBackgroundStyle } from "@/lib/cloudinary-utils"
import { QuickInquiry } from "./QuickInquiry"

export function ProductCard({ product, categoryLabel }: { product: Product; categoryLabel?: string }) {
  const [showInquiry, setShowInquiry] = useState(false)

  const handleWhatsAppClick = () => {
    const productUrl = siteUrl(`/catalog/${product.slug}`)
    const message = generateWhatsAppProductMessage({
      productName: product.title,
      priceRange: product.priceRange,
      categoryName: categoryLabel,
      productImage: product.featuredImage,
      productUrl,
    })
    const url = getWhatsAppUrl(SITE.whatsapp, message)
    window.open(url, "_blank")
    trackWhatsAppClick("product_card", product.id, product.title)
  }

  return (
    <>
      <Card as="article" className="flex flex-col">
        <Link
          href={`/catalog/${product.slug}`}
          className="block relative aspect-square overflow-hidden bg-surface"
          style={getBlurBackgroundStyle(product.featuredImage)}
        >
          <Image
            src={optimizeImage(product.featuredImage, 600)}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-zinc-900/90 text-zinc-300 border border-zinc-800">
              {categoryLabel ?? product.category}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            {product.priceRange && (
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded bg-black/60 text-white backdrop-blur-sm">
                {product.priceRange}
              </span>
            )}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-black/40 text-white/80 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                {(product.galleryImages?.length ?? 0) + 1}
              </span>
            )}
          </div>
        </Link>

        <div className="flex flex-col flex-1 p-4">
          <Link href={`/catalog/${product.slug}`}>
            <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-300 line-clamp-1">
              {product.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-muted line-clamp-2 flex-1">
            {product.shortDescription}
          </p>

          {product.material && (
            <span className="mt-2 inline-block text-[10px] text-muted-foreground/60 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              {product.material}
            </span>
          )}

          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>3–5 day turnaround</span>
          </div>

          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <button
              onClick={handleWhatsAppClick}
              className={cn(
                "inline-flex items-center justify-center gap-2 w-full h-10 text-sm font-medium rounded-lg",
                "bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97]",
                "transition-colors duration-150 cursor-pointer"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order Now</span>
            </button>
            <button
              onClick={() => setShowInquiry(true)}
              className={cn(
                "inline-flex items-center justify-center gap-2 w-full h-9 text-xs font-medium rounded-lg",
                "bg-zinc-800 text-muted-foreground hover:text-foreground border border-border",
                "transition-colors duration-150 cursor-pointer"
              )}
            >
              Request Custom Quote
            </button>
          </div>
        </div>
      </Card>

      {showInquiry && (
        <QuickInquiry
          productName={product.title}
          productCategory={categoryLabel}
          sourcePage={product.slug}
          source="product_card"
          onClose={() => setShowInquiry(false)}
        />
      )}
    </>
  )
}