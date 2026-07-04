import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const {data: username} = await supabase.from('users')
    .select('username')
    .eq('id', user.id)
    .single()

  redirect(`/user/${username?.username}`)
}
