import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: Record<string, string>
  hover?: boolean
  as?: "div" | "article" | "li"
  onClick?: () => void
}

export function Card({
  children,
  className,
  style,
  hover = true,
  as: Tag = "div",
  onClick,
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden select-none",
        hover && "transition-colors duration-200 hover:bg-zinc-800/50 hover:border-zinc-700",
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}
