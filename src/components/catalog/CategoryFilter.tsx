"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Sparkles, Scroll, Cog, Wrench, Layers } from "lucide-react"

const categoryIcons: Record<string, typeof Sparkles> = {
  "spiritual-decor": Sparkles,
  "cosplay": Scroll,
  "prototypes": Cog,
  "custom": Wrench,
}

const fallbackIcon = Layers

interface CategoryFilterProps {
  active: string | null
  onChange: (category: string | null) => void
  counts?: Record<string, number>
  slugMap?: Record<string, string>
}

export const CategoryFilter = memo(function CategoryFilter({ active, onChange, counts, slugMap }: CategoryFilterProps) {
  const categories = useMemo(() => {
    const entries = slugMap ? Object.entries(slugMap).map(([value, label]) => ({ value, label })) : []
    return [
      { value: "all", label: "All" },
      ...entries,
    ]
  }, [slugMap])

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
      {categories.map((cat) => {
        const Icon = cat.value === "all" ? fallbackIcon : (categoryIcons[cat.value] ?? fallbackIcon)
        const count = counts?.[cat.value] ?? 0
        const isActive = cat.value === "all" ? !active : active === cat.value

        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value === "all" ? null : cat.value)}
            className={cn(
              "inline-flex items-center gap-1.5 shrink-0 px-3.5 py-2 text-[13px] font-medium rounded-lg border transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-zinc-600"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
            {count > 0 && (
              <span className={cn(
                "ml-0.5 text-[11px] font-semibold tabular-nums",
                isActive
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground/60"
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
})