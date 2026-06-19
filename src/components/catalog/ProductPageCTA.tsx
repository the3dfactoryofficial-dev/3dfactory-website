"use client"

import { useState } from "react"
import { PenLine } from "lucide-react"
import { generateWhatsAppProductMessage, getWhatsAppUrl } from "@/lib/utils"
import { SITE } from "@/lib/constants"
import { siteUrl } from "@/lib/url"
import { trackWhatsAppClick } from "@/lib/analytics"
import { QuickInquiry } from "./QuickInquiry"

interface ProductPageCTAProps {
  productId: string
  productName: string
  productSlug: string
  categoryLabel?: string
  featuredImage: string
  priceRange?: string
}

export function ProductPageCTA({
  productId,
  productName,
  productSlug,
  categoryLabel,
  featuredImage,
  priceRange,
}: ProductPageCTAProps) {
  const [showInquiry, setShowInquiry] = useState(false)

  const handleWhatsAppClick = (source: string) => {
    const productUrl = siteUrl(`/catalog/${productSlug}`)
    const message = generateWhatsAppProductMessage({
      productName,
      priceRange,
      categoryName: categoryLabel,
      productImage: featuredImage,
      productUrl,
    })
    const url = getWhatsAppUrl(SITE.whatsapp, message)
    window.open(url, "_blank")
    trackWhatsAppClick(source, productId, productName)
  }

  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )

  const primaryButtonClass =
    "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97] transition-all duration-200 cursor-pointer"

  const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-lg bg-zinc-800 text-foreground hover:bg-zinc-700 active:scale-[0.97] border border-border transition-all duration-200 cursor-pointer"

  const mobilePrimaryClass =
    "flex items-center justify-center gap-2 w-full h-13 text-base font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97] transition-all duration-150 cursor-pointer"

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => handleWhatsAppClick("product_page")} className={primaryButtonClass}>
          {icon}
          <span>Order Now</span>
        </button>
        <button onClick={() => setShowInquiry(true)} className={secondaryButtonClass}>
          <PenLine className="w-5 h-5" />
          <span>Request Custom Quote</span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom,1rem))] bg-gradient-to-t from-background via-background/95 to-transparent md:hidden">
        <button onClick={() => handleWhatsAppClick("product_page_mobile")} className={mobilePrimaryClass}>
          {icon}
          <span>Order Now</span>
        </button>
      </div>

      {showInquiry && (
        <QuickInquiry
          productName={productName}
          productCategory={categoryLabel}
          sourcePage={productSlug}
          source="product_page"
          onClose={() => setShowInquiry(false)}
        />
      )}
    </>
  )
}
