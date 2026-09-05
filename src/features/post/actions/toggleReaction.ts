'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'
import { isReactionType, type ReactionType } from '../reactions'

type ToggleReactionResult =
  | { success: true; reaction: ReactionType | null }
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
    .select('id, reaction_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('REACTION SELECT ERROR:', selectError)
    return { success: false, error: 'リアクションの状態を取得できませんでした。' }
  }

  if (existingReaction?.reaction_type === reaction) {
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('id', existingReaction.id)

    if (deleteError) {
      console.error('REACTION DELETE ERROR:', deleteError)
      return { success: false, error: 'リアクションを解除できませんでした。' }
    }

    revalidateReactionViews(postId)
    return { success: true, reaction: null }
  }

  if (existingReaction) {
    const { error: updateError } = await supabase
      .from('post_likes')
      .update({ reaction_type: reaction })
      .eq('id', existingReaction.id)

    if (updateError) {
      console.error('REACTION UPDATE ERROR:', updateError)
      return { success: false, error: 'リアクションを変更できませんでした。' }
    }

    revalidateReactionViews(postId)
    return { success: true, reaction }
  }

  const { error: insertError } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: user.id,
    reaction_type: reaction,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: currentReaction } = await supabase
        .from('post_likes')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()

      revalidateReactionViews(postId)
      return {
        success: true,
        reaction: isReactionType(currentReaction?.reaction_type)
          ? currentReaction.reaction_type
          : 'like',
      }
    }

    console.error('REACTION INSERT ERROR:', insertError)
    return { success: false, error: 'リアクションできませんでした。' }
  }

  revalidateReactionViews(postId)
  return { success: true, reaction }
}
