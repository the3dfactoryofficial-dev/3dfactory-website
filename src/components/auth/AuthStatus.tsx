"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { LogIn, LogOut, LayoutDashboard, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function AuthStatus() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  if (isLoading) {
    return <div className="w-[88px] h-10 rounded-lg bg-zinc-800/50 animate-pulse" />
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-lg",
          "bg-zinc-800 text-foreground hover:bg-zinc-700 border border-border",
          "transition-all duration-200 w-full sm:w-auto"
        )}
      >
        <LogIn className="w-4 h-4 shrink-0" />
        <span>Login</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <Link
        href="/profile"
        className={cn(
          "inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg",
          "bg-zinc-800 text-foreground hover:bg-zinc-700 border border-border",
          "transition-all duration-200"
        )}
      >
        <User className="w-4 h-4 shrink-0" />
        <span>Profile</span>
      </Link>

      {session.user.isAdmin && (
        <Link
          href="/admin/products"
          className={cn(
            "inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg",
            "bg-primary text-primary-foreground hover:bg-primary-hover",
            "transition-all duration-200"
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </Link>
      )}

      <button
        onClick={() => signOut({ redirectTo: "/" })}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-lg",
          "bg-zinc-800 text-foreground hover:bg-zinc-700 border border-border",
          "transition-all duration-200"
        )}
        title="Sign out"
      >
        <LogOut className="w-4 h-4 shrink-0" />
      </button>
    </div>
  )
}
