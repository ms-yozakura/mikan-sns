'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'
import { sendPushToUser } from '@/features/notification/lib/push'
import { isReactionType, type ReactionType } from '../reactions'

type ToggleReactionResult =
  | { success: true; active: boolean; reaction: ReactionType }
  | { success: false; error: string }

function revalidateReactionViews(postId: string) {
  revalidatePath('/home')
  revalidatePath('/profile')
  revalidatePath(`/post/${postId}`)
  revalidatePath('/user/[userId]', 'page')
}

export async function toggleReaction(
  postId: string,
  reaction: ReactionType
): Promise<ToggleReactionResult> {
  if (!isReactionType(reaction)) {
    return { success: false, error: '不正なリアクションです。' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'ログインが必要です。' }
  }

  const { data: existingReaction, error: selectError } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('reaction_type', reaction)
    .maybeSingle()

  if (selectError) {
    console.error('REACTION SELECT ERROR:', selectError)
    return { success: false, error: 'リアクションの状態を取得できませんでした。' }
  }

  if (existingReaction) {
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('id', existingReaction.id)

    if (deleteError) {
      console.error('REACTION DELETE ERROR:', deleteError)
      return { success: false, error: 'リアクションを解除できませんでした。' }
    }

    revalidateReactionViews(postId)
    return { success: true, active: false, reaction }
  }

  const { error: insertError } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: user.id,
    reaction_type: reaction,
  })

  if (insertError && insertError.code !== '23505') {
    console.error('REACTION INSERT ERROR:', insertError)
    return { success: false, error: 'リアクションできませんでした。' }
  }

  if (!insertError) {
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .maybeSingle()

    if (post?.user_id && post.user_id !== user.id) {
      await sendPushToUser(post.user_id, {
        title: 'MikanSNS',
        body: 'あなたの投稿に新しいリアクションがつきました',
        url: `/post/${postId}`,
        tag: `post-${postId}`,
      })
    }
  }

  revalidateReactionViews(postId)
  return { success: true, active: true, reaction }
}
