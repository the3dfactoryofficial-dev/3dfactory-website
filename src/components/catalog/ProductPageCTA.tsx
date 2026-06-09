"use client"

import { useState } from "react"
import { QuickInquiry } from "./QuickInquiry"

interface ProductPageCTAProps {
  productName: string
  productSlug: string
  categoryLabel?: string
}

export function ProductPageCTA({ productName, productSlug, categoryLabel }: ProductPageCTAProps) {
  const [showInquiry, setShowInquiry] = useState(false)

  const buttonClass =
    "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-xl bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97] shadow-lg shadow-[#25D366]/20 transition-all duration-200 cursor-pointer"

  const mobileButtonClass =
    "flex items-center justify-center gap-2 w-full h-13 text-base font-medium rounded-xl bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg shadow-[#25D366]/15 transition-all duration-150 active:scale-[0.97] cursor-pointer"

  return (
    <>
      <button onClick={() => setShowInquiry(true)} className={buttonClass}>
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
        <span>Get This Custom Made</span>
      </button>

      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom,1rem))] bg-gradient-to-t from-background via-background/95 to-transparent md:hidden">
        <button onClick={() => setShowInquiry(true)} className={mobileButtonClass}>
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
          <span>Get This Custom Made</span>
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
