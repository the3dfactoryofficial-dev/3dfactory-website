import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function DebugAuthPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    redirect("/")
  }
  redirect("/admin")
}
