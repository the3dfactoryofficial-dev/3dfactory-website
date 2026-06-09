"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { SITE } from "@/lib/constants"
import { trackWhatsAppClick } from "@/lib/analytics"

const HIDDEN_PATHS = ["/contact", "/admin", "/catalog"]

function isModalOpen(): boolean {
  if (typeof document === "undefined") return false
  return document.body.hasAttribute("data-inquiry-modal-open")
}

function shouldHideOnPath(pathname: string): boolean {
  return HIDDEN_PATHS.some((p) => pathname.startsWith(p)) || isModalOpen()
}

export function StickyInquiryBar() {
  const pathname = usePathname()
  const visibleRef = useRef(false)
  const elRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    if (shouldHideOnPath(pathname)) {
      if (elRef.current) elRef.current.style.display = "none"
      return
    }
    const onScroll = () => {
      if (isModalOpen()) {
        if (elRef.current) elRef.current.style.display = "none"
        return
      }
      const show = window.scrollY > 600 && window.scrollY < document.body.scrollHeight - 1200
      if (show !== visibleRef.current) {
        visibleRef.current = show
        if (elRef.current) elRef.current.style.display = show ? "" : "none"
      }
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (isModalOpen()) {
        if (elRef.current) elRef.current.style.display = "none"
      }
    })
    observer.observe(document.body, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi! I'd like to discuss a custom 3D printing project.")}`

  const handleClick = () => {
    trackWhatsAppClick("sticky_bar")
  }

  return (
    <a
      ref={elRef}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{ display: "none" }}
      className="fixed bottom-24 right-5 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 hover:bg-[#20BD5A] active:scale-95 transition-all duration-200 md:hidden select-none"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  )
}
