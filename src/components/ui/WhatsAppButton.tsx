import { MessageCircle } from "lucide-react"
import { cn, formatWhatsAppUrl } from "@/lib/utils"
import { SITE } from "@/lib/constants"

interface WhatsAppButtonProps {
  productName: string
  variant?: "primary" | "secondary" | "icon"
  className?: string
}

export function WhatsAppButton({
  productName,
  variant = "primary",
  className,
}: WhatsAppButtonProps) {
  const url = formatWhatsAppUrl(SITE.whatsapp, productName)

  if (variant === "icon") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-95 transition-all duration-200",
          className
        )}
        aria-label={`Inquire about ${productName} on WhatsApp`}
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200",
        "h-11 px-6 text-sm",
        variant === "primary" &&
          "bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97]",
        variant === "secondary" &&
          "border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 active:scale-[0.97]",
        className
      )}
    >
      <MessageCircle className="w-4 h-4" />
      <span>Inquire on WhatsApp</span>
    </a>
  )
}
