"use client"

import { useState, useEffect, startTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { SITE, NAV_LINKS } from "@/lib/constants"
import { AuthStatus } from "@/components/auth/AuthStatus"
import { lockBodyScroll, unlockBodyScroll, forceUnlockAll } from "@/lib/ui/scroll-lock"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    forceUnlockAll()
    startTransition(() => setIsMobileOpen(false))
  }, [pathname])

  useEffect(() => {
    if (isMobileOpen) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
    return () => { if (isMobileOpen) unlockBodyScroll() }
  }, [isMobileOpen])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
? "bg-background/80 backdrop-blur-xl border-b border-border"
           : "bg-transparent"
      )}
    >
      <nav className="container-main flex items-center justify-between h-16 md:h-18">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          {SITE.name}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-95 transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
          <AuthStatus />
        </div>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-150"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container-main py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-medium py-3 transition-colors",
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 text-sm font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97] transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <AuthStatus />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
