"use server"

import { createClient } from "@/infrastructure/supabase/server"
import { revalidatePath } from "next/cache"

export async function createComment(
  prevState: any,
  formData: FormData
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "ログインしてください" }
  }

  const body = String(formData.get("body") ?? "").trim()
  const postId = String(formData.get("postId"))

  if (!body) {
    return { error: "コメントを入力してください" }
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      body,
      post_id: postId,
      user_id: user.id,
    })
    .select(`
      *,
      users (
        username,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/post/${postId}`)

  return { success: true, comment: data }
}
