import Image from "next/image"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema.pg"
import { eq } from "drizzle-orm"
import { Calendar, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { BackButton } from "@/components/ui/BackButton"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?redirect=/profile")
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!user) {
    redirect("/")
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  })

  const lastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="container-main max-w-md mx-auto">
        <div className="mb-4">
          <BackButton fallbackHref="/" />
        </div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-surface bg-zinc-800">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {(user.name ?? user.email)[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="mt-4 text-xl font-bold text-foreground">
                {user.name ?? "User"}
              </h1>

              <p className="text-sm text-muted mt-1">{user.email}</p>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 mt-4 text-xs font-medium rounded-full border",
                  user.role === "admin"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-zinc-800 text-muted-foreground border-border"
                )}
              >
                <Shield className="w-3 h-3" />
                {user.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Joined</span>
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {joinedDate}
                </div>
              </div>

              {lastLogin && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Login
                  </span>
                  <span className="text-sm text-foreground">{lastLogin}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
