import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  as?: "button" | "a"
  href?: string
  external?: boolean
  children: React.ReactNode
}

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97]",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-zinc-700 active:scale-[0.97] border border-border",
  ghost: "text-foreground hover:bg-zinc-800 active:scale-[0.97]",
  outline:
    "border border-border text-foreground hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.97]",
}

const sizes = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2.5",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      as: Tag = "button",
      href,
      external,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer select-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      sizes[size],
      className
    )

    if (Tag === "a" && href) {
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={classes}
        >
          {children}
        </a>
      )
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
