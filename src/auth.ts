import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db } from "@/db"
import { users } from "@/db/schema.pg"
import { eq } from "drizzle-orm"

const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
})

googleProvider.clientId = process.env.AUTH_GOOGLE_ID
googleProvider.clientSecret = process.env.AUTH_GOOGLE_SECRET

function normalizeEmail(email: unknown): string {
  return String(email ?? "").toLowerCase().trim()
}

async function syncUser(email: string, name: string | null, image: string | null) {
  const adminEmail = normalizeEmail(process.env.ADMIN_GOOGLE_EMAIL)
  const role: "admin" | "user" = email === adminEmail ? "admin" : "user"
  const now = new Date().toISOString()

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing) {
      await db
        .update(users)
        .set({
          name: name ?? undefined,
          image: image ?? undefined,
          role,
          lastLoginAt: now,
          updatedAt: now,
        })
        .where(eq(users.email, email))
      return existing.id
    }

    const id = crypto.randomUUID()
    await db.insert(users).values({
      id,
      email,
      name,
      image,
      role,
      lastLoginAt: now,
    })
    return id
  } catch (err) {
    console.error("[AUTH syncUser] Failed:", err)
    return null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [googleProvider],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        await syncUser(
          normalizeEmail(user.email),
          user.name ?? null,
          user.image ?? null,
        )
      }

      return true
    },
    async jwt({ token, account, profile }) {
      if (account) {
        const userEmail = normalizeEmail(token.email ?? profile?.email)
        const adminEmail = normalizeEmail(process.env.ADMIN_GOOGLE_EMAIL)
        token.isAdmin = userEmail.length > 0 && userEmail === adminEmail
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = !!token.isAdmin
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
