
import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/globals.css'

import { Navigation } from '@/features/navigation/Navigation'
import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"
import { ProtectedShell } from './ProtectedShell'
import { HomeStatsSummary } from '@/features/stats/components/HomeStatsSummary'
import { getGlobalStats } from '@/features/stats/actions/getGlobalStats'

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [{ data: profile }, stats, { count: unreadCount }] = await Promise.all([
    supabase
      .from("users")
      .select("avatar_url,username,display_name")
      .eq("id", user.id)
      .single(),
    getGlobalStats(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ])

  return (
    <ProtectedShell
      navigation={<Navigation profile={profile} unreadCount={unreadCount ?? 0} />}
      stats={<HomeStatsSummary variant="desktop" stats={stats} />}
    >
      {children}
    </ProtectedShell>
  )
}
