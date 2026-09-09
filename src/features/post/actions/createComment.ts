"use server"

import { createClient } from "@/infrastructure/supabase/server"
import { sendPushToUser } from "@/features/notification/lib/push"
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
  const postId = String(formData.get("postId") ?? "")
  const parentCommentValue = formData.get("parentCommentId")
  const parentCommentId =
    typeof parentCommentValue === "string" && parentCommentValue
      ? parentCommentValue
      : null

  if (!body) {
    return { error: "コメントを入力してください" }
  }

  if (!postId) {
    return { error: "投稿が見つかりません" }
  }

  let parentComment: { id: string; post_id: string | null; user_id: string } | null = null

  if (parentCommentId) {
    const { data: fetchedParent, error: parentError } = await supabase
      .from("comments")
      .select("id, post_id, user_id")
      .eq("id", parentCommentId)
      .maybeSingle()

    if (parentError || !fetchedParent || fetchedParent.post_id !== postId) {
      return { error: "返信先のコメントが見つかりません" }
    }

    parentComment = fetchedParent
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      body,
      post_id: postId,
      user_id: user.id,
      parent_comment_id: parentComment?.id ?? null,
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

  let recipientId = parentComment?.user_id ?? null
  let pushBody = "あなたのコメントに返信がつきました"

  if (!parentComment) {
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .maybeSingle()

    recipientId = post?.user_id ?? null
    pushBody = "あなたの投稿に新しいコメントがつきました"
  }

  if (recipientId && recipientId !== user.id) {
    await sendPushToUser(recipientId, {
      title: "MikanSNS",
      body: pushBody,
      url: `/post/${postId}#comment-${data.id}`,
      tag: `comment-${data.id}`,
    })
  }

  revalidatePath(`/post/${postId}`)

  return { success: true, comment: data }
}
