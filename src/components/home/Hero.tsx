"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { MessageCircle, Package, Sparkles, Truck, Clock } from "lucide-react"
import Link from "next/link"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { trackWhatsAppClick } from "@/lib/analytics"

const stats = [
  { icon: Package, label: "500+ Creations Delivered" },
  { icon: Clock, label: "48hr Rapid Turnaround" },
  { icon: Truck, label: "Pan-India Shipping" },
  { icon: Sparkles, label: "Custom Crafted" },
] as const

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
} as const

export function Hero() {
  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden pt-24 pb-16 md:pt-28 md:pb-20">
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-background"
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-5 md:opacity-15 transition-opacity duration-700">
          <Image
            src="/images/products/ChromiumHanuman.jpg"
            alt=""
            fill
            className="object-cover object-center scale-105"
            priority
            loading="eager"
            sizes="100vw"
          />
        </div>

        <div className="absolute inset-0 bg-hero-vignette" />
      </div>

      <motion.div
        className="container-main w-full relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 rounded-full">
              Custom 3D Creation Studio
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05]"
          >
            Custom 3D Creations{" "}
            <span className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent text-glow-amber">
              Made Just for You
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
          >
            From personalized gifts and home decor to cosplay collectibles
            and functional prototypes — we bring your ideas to life with
            premium 3D printing, delivered across India.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("hero")}
              className={cn(
                "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-xl",
                "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97]",
                "shadow-lg shadow-primary/25 transition-all duration-200",
                "w-full sm:w-auto select-none"
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Your Custom Print</span>
            </a>

            <Link
              href="/catalog"
              className={cn(
                "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-xl",
                "border border-border text-foreground hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.97]",
                "transition-all duration-200",
                "w-full sm:w-auto select-none"
              )}
            >
              <Package className="w-5 h-5" />
              <span>Explore Catalog</span>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface border border-border/50"
              >
                <stat.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground text-center leading-snug">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
