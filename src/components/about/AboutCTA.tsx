import { MessageCircle } from "lucide-react"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function AboutCTA() {
  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi! I'd like to discuss a custom 3D printing project.")}`

  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="container-main">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Let&apos;s Build Something Together
          </h2>

          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-lg mx-auto">
            Whether you need a single prototype, a batch of custom products, or
            just want to explore what&apos;s possible — we&apos;re here to help.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center justify-center gap-2.5 h-14 px-9 text-base font-medium rounded-lg mt-8",
              "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97]",
              "transition-all duration-200 select-none"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Start a Conversation</span>
          </a>

          <p className="mt-4 text-xs text-muted-foreground">
            Quick replies • Custom quotes • No obligation
          </p>
        </div>
      </div>
    </section>
  )
}
