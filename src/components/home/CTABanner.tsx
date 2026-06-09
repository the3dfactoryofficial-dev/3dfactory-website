import { MessageCircle, Zap, PenTool, Truck } from "lucide-react"
import Link from "next/link"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"

const reassurances = [
  { icon: Zap, text: "Fast replies" },
  { icon: PenTool, text: "Custom designs" },
  { icon: Truck, text: "Free shipping above ₹999" },
] as const

export function CTABanner() {
  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi! I'd like to discuss a custom 3D printing project.")}`

  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      <div className="container-main relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Ready to Build{" "}
            <span className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent text-glow-amber">
              Something Amazing?
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-lg mx-auto">
            Whether it&apos;s a custom gift, a decor piece, or a batch of
            collectibles — share your idea and we&apos;ll bring it to life.
            Quick quotes, custom designs, delivered to your door.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center gap-2.5 h-14 px-9 text-base font-medium rounded-lg",
                "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97]",
                "transition-all duration-200",
                "w-full sm:w-auto select-none"
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Your Custom Print</span>
            </a>

            <Link
              href="/catalog"
              className={cn(
                "inline-flex items-center justify-center gap-2.5 h-14 px-9 text-base font-medium rounded-lg",
                "border border-border text-foreground hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.97]",
                "transition-all duration-200",
                "w-full sm:w-auto select-none"
              )}
            >
              <span>Browse Designs</span>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {reassurances.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
