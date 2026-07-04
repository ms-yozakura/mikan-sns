
import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/globals.css'

import { Navigation } from '@/features/navigation/Navigation'
import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"
import { ProtectedShell } from './ProtectedShell'
import { HomeStatsSummary } from '@/features/stats/components/HomeStatsSummary'

export default async function ProtectedLayout({

  children

}: {

  children: React.ReactNode

}) {

  const supabase = await createClient()

  const {

    data: { user }

  } = await supabase.auth.getUser()

  if (!user) {

    redirect("/login")

  }

  const { data: profile } = await supabase
    .from("users")
    .select("avatar_url,username,display_name")
    .eq("id", user.id)
    .single()

  return (
    <ProtectedShell
      navigation={<Navigation profile={profile} />}
      stats={<HomeStatsSummary variant="desktop" />}
    >
      {children}
    </ProtectedShell>
  )

}
