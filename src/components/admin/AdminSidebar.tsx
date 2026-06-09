"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav"
import { cn } from "@/lib/utils"

export function AdminSidebar({ email, signOutForm }: { email: string; signOutForm: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col w-72 h-screen bg-surface border-r border-border shrink-0 sticky top-0">
      <div className="flex items-center px-5 h-16 border-b border-border shrink-0">
        <Link href="/admin/products" className="text-base font-bold tracking-tight text-foreground">
          Dashboard
        </Link>
      </div>
      <div className="px-5 py-3 border-b border-border shrink-0">
        <p className="text-[11px] text-muted-foreground">Signed in as</p>
        <p className="text-sm text-foreground truncate">{email}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:bg-zinc-800 border border-transparent select-none"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-border shrink-0">
        {signOutForm}
      </div>
    </aside>
  )
}
