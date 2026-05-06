import { redirect } from "next/navigation"
import { hasSuperAdminAction } from "@/app/actions/users"
import { SetupForm } from "@/components/setup-form"

export const dynamic = "force-dynamic"

export default async function SetupPage() {
  const exists = await hasSuperAdminAction()
  if (exists) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <SetupForm />
    </div>
  )
}
