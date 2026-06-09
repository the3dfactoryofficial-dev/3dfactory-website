import { MessageCircle } from "lucide-react"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function ContactCTA() {
  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi! I'd like to discuss a custom 3D printing project.")}`

  return (
    <section className="pb-24 md:pb-32">
      <div className="container-main">
        <div className="max-w-xl mx-auto text-center rounded-xl bg-zinc-900 border border-zinc-800 p-10 md:p-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Prefer to jump straight in?
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Skip the form and send us a message directly on WhatsApp. We&apos;re
            ready when you are.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-lg mt-6",
              "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97]",
              "transition-all duration-200 select-none"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Message Us on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  )
}
