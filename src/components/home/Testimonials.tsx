"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Star, Quote, ChevronLeft, ChevronRight, Package, Truck, Sparkles, Zap } from "lucide-react"
import { Section } from "@/components/ui/Section"
import { Heading } from "@/components/ui/Heading"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import type { Testimonial } from "@/lib/storage/testimonial-types"
import { optimizeImage, getBlurBackgroundStyle } from "@/lib/cloudinary-utils"

const metrics = [
  { icon: Package, label: "Prints Completed", value: "500+" },
  { icon: Truck, label: "Pan-India Delivery", value: "All Cities" },
  { icon: Sparkles, label: "Print Technologies", value: "FDM & Resin" },
  { icon: Zap, label: "Turnaround", value: "24–48hrs" },
]

export function Testimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % Math.max(testimonials.length, 1))
  }, [testimonials.length])

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + testimonials.length) % Math.max(testimonials.length, 1))
  }, [testimonials.length])

  // Auto-rotate
  useEffect(() => {
    if (testimonials.length < 2) return
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length, next])

  return (
    <Section id="testimonials">
      <Heading
        eyebrow="Testimonials"
        title="What Our Clients Say"
        subtitle="Hear from creators, collectors, and brands who trust us to bring their ideas to life."
      />

      {testimonials.length > 0 ? (
        <div className="mt-12 md:mt-16 max-w-3xl mx-auto">
          <div className="relative rounded-2xl bg-card border border-border p-8 md:p-10">
            <Quote className="absolute top-6 left-6 w-8 h-8 text-primary/10" />

            <div className="relative z-10 min-h-[180px] flex flex-col justify-center">
              <p className="text-base md:text-lg text-foreground/90 leading-relaxed italic">
                &ldquo;{testimonials[current]?.content}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-4">
                {testimonials[current]?.imageUrl && (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-border shrink-0">
                    <Image
                      src={optimizeImage(testimonials[current].imageUrl, 96)}
                      alt={testimonials[current].name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonials[current]?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[testimonials[current]?.role, testimonials[current]?.company]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="ml-auto">
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonials[current]?.rating ?? 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/40 text-white hover:bg-zinc-950/60 transition-colors flex items-center justify-center backdrop-blur-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/40 text-white hover:bg-zinc-950/60 transition-colors flex items-center justify-center backdrop-blur-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex justify-center gap-1.5 mt-6">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        i === current ? "bg-primary w-6" : "bg-zinc-600 hover:bg-zinc-500"
                      )}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Golden Hanuman Statue", category: "Spiritual Decor", note: "Metallic-coated Hanuman with high-detail layered finishing — a custom decor piece", image: "/images/products/ChromiumHanuman.jpg" },
            { title: "Custom Mechanical Assembly", category: "Prototypes & Custom Parts", note: "Multi-part precision assembly built for a client's functional prototype", image: "/images/products/CustomGun-1.jpg" },
            { title: "Mewtwo Armor Figure", category: "Cosplay & Collectibles", note: "Articulated armor collectible with precision printed parts — a fan's dream piece", image: "/images/products/Mew2-1.jpg" },
            { title: "Glow-in-the-Dark Shiva", category: "Spiritual Decor", note: "Glow filament statue with ambient night illumination — a custom gift piece", image: "/images/products/ShivaGlow.jpeg" },
          ].map((item) => (
            <Card key={item.title} as="article" className="flex flex-col group">
              <div
                className="relative aspect-[4/5] overflow-hidden bg-surface"
                style={getBlurBackgroundStyle(item.image)}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover transition-opacity duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground border border-border/50">{item.category}</span>
                </div>
              </div>
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed flex-1">{item.note}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {metrics.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface border border-border/50">
            <stat.icon className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-foreground">{stat.value}</span>
            <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}
