"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Sparkles } from "lucide-react"
import type { Product } from "@/types"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { SITE } from "@/lib/constants"
import { optimizeImage, getBlurBackgroundStyle } from "@/lib/cloudinary-utils"
import { QuickInquiry } from "./QuickInquiry"

export function ProductCard({ product, categoryLabel }: { product: Product; categoryLabel?: string }) {
  const [showInquiry, setShowInquiry] = useState(false)

  return (
    <>
      <Card as="article" className="flex flex-col">
        <Link
          href={`/catalog/${product.slug}`}
          className="block relative aspect-[4/5] overflow-hidden bg-surface"
          style={getBlurBackgroundStyle(product.featuredImage)}
        >
          <Image
            src={optimizeImage(product.featuredImage, 600)}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground border border-border/50">
              {categoryLabel ?? product.category}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            {product.galleryImages && product.galleryImages.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md bg-black/50 text-white/70 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                Gallery
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md bg-amber-500/20 text-amber-400 backdrop-blur-sm">
              Made on Request
            </span>
          </div>
        </Link>

        <div className="flex flex-col flex-1 p-5">
          <Link href={`/catalog/${product.slug}`}>
            <h3 className="text-base font-semibold text-foreground hover:text-primary transition-colors duration-300">
              {product.title}
            </h3>
          </Link>

          <p className="mt-1.5 text-sm text-muted leading-relaxed flex-1 line-clamp-2">
            {product.shortDescription}
          </p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {product.priceRange && (
              <p className="text-xs text-muted-foreground font-medium">
                Starting {product.priceRange}
              </p>
            )}
            {product.material && (
              <span className="text-[10px] text-muted-foreground/60 px-2 py-0.5 rounded-md bg-zinc-800/50 border border-border/30">
                {product.material}
              </span>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setShowInquiry(true)}
              className={cn(
                "inline-flex items-center justify-center gap-2 w-full h-12 text-sm font-medium rounded-xl",
                "bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97]",
                "transition-all duration-200 shadow-lg shadow-[#25D366]/15 cursor-pointer"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get This Custom Made</span>
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