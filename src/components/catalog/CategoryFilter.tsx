"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Sparkles, Scroll, Cog, Wrench } from "lucide-react"

const categoryIcons: Record<string, typeof Sparkles> = {
  "spiritual-decor": Sparkles,
  "cosplay": Scroll,
  "prototypes": Cog,
  "custom": Wrench,
}

const fallbackIcon = Sparkles
const allIcon = Sparkles

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
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
      {categories.map((cat) => {
        const Icon = cat.value === "all" ? allIcon : (categoryIcons[cat.value] ?? fallbackIcon)
        const count = counts?.[cat.value] ?? 0
        const isActive = cat.value === "all" ? !active : active === cat.value

        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value === "all" ? null : cat.value)}
            className={cn(
              "group relative inline-flex items-center gap-1.5 shrink-0 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer select-none",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105 active:scale-[0.97]"
                : "bg-card text-muted-foreground border-border hover:bg-card-hover hover:text-foreground hover:border-zinc-600 active:scale-[0.97]"
            )}
          >
            <Icon className={cn(
              "w-4 h-4 transition-transform duration-300",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            <span>{cat.label}</span>
            {count > 0 && (
              <span className={cn(
                "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-semibold rounded-full transition-all duration-300",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-zinc-800 text-muted-foreground group-hover:bg-zinc-700"
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
