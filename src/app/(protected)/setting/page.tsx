import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"
import { SettingPage } from '@/features/setting/pages/SettingPage'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  return <SettingPage isAdmin={currentUser?.role === "admin"} />
}
