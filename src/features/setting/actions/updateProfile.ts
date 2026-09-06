"use server"

import { createClient } from "@/infrastructure/supabase/server"

type ProfileData = {
  display_name: string
  bio: string
  region: string
  generation: number | null
  avatarUrl?: string
  favorite_mikan_ids?: string[]
}

function getAvatarStoragePath(url: string, userId: string) {
  try {
    const { pathname } = new URL(url)
    const marker = "/avatars/"
    const markerIndex = pathname.indexOf(marker)

    if (markerIndex === -1) return null

    const path = decodeURIComponent(pathname.slice(markerIndex + marker.length))
    return path.startsWith(`${userId}/`) ? path : null
  } catch {
    return null
  }
}

export async function updateProfile(data: ProfileData) {
  const supabase = await createClient()

  const { data: { user }, error, } = await supabase.auth.getUser()

  if (error || !user) throw new Error("Unauthorized")

  const favoriteMikanIds = Array.from(new Set(data.favorite_mikan_ids ?? []))
  if (favoriteMikanIds.length > 3) {
    throw new Error("推しみかんは3つまで登録できます")
  }

  if (favoriteMikanIds.length > 0) {
    const { data: validVarieties, error: varietyError } = await supabase
      .from("mikan_varieties")
      .select("id")
      .in("id", favoriteMikanIds)
      .eq("is_visible", true)

    if (varietyError) throw varietyError
    if ((validVarieties ?? []).length !== favoriteMikanIds.length) {
      throw new Error("登録できないみかんが含まれています")
    }
  }

  const { data: currentUser, error: currentUserError } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  if (currentUserError) throw currentUserError

  const oldAvatarUrl = currentUser?.avatar_url

  const { error: userError } = await supabase
    .from("users")
    .update({
      display_name: data.display_name,
      avatar_url: data.avatarUrl,
    })
    .eq("id", user.id)

  if (userError) throw userError

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      bio: data.bio,
      generation: data.generation,
      region: data.region
    }, { onConflict: "user_id" })

  if (profileError) throw profileError

  const { error: deleteFavoritesError } = await supabase
    .from("favorite_mikans")
    .delete()
    .eq("user_id", user.id)

  if (deleteFavoritesError) throw deleteFavoritesError

  if (favoriteMikanIds.length > 0) {
    const { error: insertFavoritesError } = await supabase
      .from("favorite_mikans")
      .insert(favoriteMikanIds.map((varietyId, index) => ({
        user_id: user.id,
        variety_id: varietyId,
        position: index + 1,
      })))

    if (insertFavoritesError) throw insertFavoritesError
  }

  if (oldAvatarUrl && data.avatarUrl && oldAvatarUrl !== data.avatarUrl) {
    const oldAvatarPath = getAvatarStoragePath(oldAvatarUrl, user.id)

    if (oldAvatarPath) {
      const { error: removeError } = await supabase.storage
        .from("avatars")
        .remove([oldAvatarPath])

      if (removeError) {
        console.error("Failed to remove old avatar", removeError)
      }
    }
  }

  return {
    success: true,
  }
}
