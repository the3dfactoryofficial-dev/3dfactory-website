import { cn } from "@/lib/utils"

interface HeadingProps {
  title: string
  subtitle?: string
  eyebrow?: string
  as?: "h1" | "h2" | "h3" | "h4"
  className?: string
  align?: "left" | "center"
}

export function Heading({
  title,
  subtitle,
  eyebrow,
  as: Tag = "h2",
  className,
  align = "center",
}: HeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-primary mb-3">
          {eyebrow}
        </span>
      )}
      <Tag className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:tracking-[-0.02em]">
        {title}
      </Tag>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  )
}