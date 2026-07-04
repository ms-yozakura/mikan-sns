"use server"

import { createClient } from "@/infrastructure/supabase/server"

type ProfileData = {
  display_name: string
  bio: string
  region: string
  generation: number | null
  avatarUrl?: string
}

export async function updateProfile(data: ProfileData) {
  const supabase = await createClient()

  const { data: { user }, error, } = await supabase.auth.getUser()

  if (error || !user) throw new Error("Unauthorized")


  // usersテーブル
  const { error: userError } = await supabase
    .from("users")
    .update({
      display_name: data.display_name,
      avatar_url: data.avatarUrl,
    })
    .eq("id", user.id)

  if (userError) throw userError

  // profilesテーブル
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      bio: data.bio,
      generation: data.generation,
      region: data.region
    }, { onConflict: "user_id" })

  if (profileError) throw profileError

  return {
    success: true,
  }
}
