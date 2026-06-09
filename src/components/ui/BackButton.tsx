"use client"

import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSafeBack } from "@/lib/navigation/back"

type BackButtonProps = {
  fallbackHref?: string
  label?: string
  variant?: "ghost" | "glass" | "solid"
  className?: string
  sticky?: boolean
}

const variantStyles: Record<string, string> = {
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-zinc-800/50",
  glass:
    "bg-black/55 backdrop-blur-md border border-white/10 text-foreground hover:bg-black/70",
  solid:
    "bg-surface border border-border text-foreground hover:bg-zinc-800",
}

export function BackButton({
  fallbackHref = "/",
  label = "Back",
  variant = "glass",
  className,
  sticky = false,
}: BackButtonProps) {
  const goBack = useSafeBack(fallbackHref)

  return (
    <button
      onClick={goBack}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-sm font-medium rounded-full",
        "transition-all duration-200 active:scale-[0.96]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "min-h-[44px] min-w-[44px] h-11 px-4",
        variantStyles[variant],
        sticky &&
          "fixed top-[4.5rem] left-4 z-40 md:static md:z-auto",
        className,
      )}
      aria-label={`Go back${fallbackHref !== "/" ? ` to previous page` : ""}`}
    >
      <ArrowLeft className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
