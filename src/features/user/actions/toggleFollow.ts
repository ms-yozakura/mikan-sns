'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'

type ToggleFollowResult =
  | { success: true; following: boolean }
  | { success: false; error: string }

function revalidateFollowViews() {
  revalidatePath('/profile')
  revalidatePath('/user/[userId]', 'page')
}

export async function toggleFollow(targetUserId: string): Promise<ToggleFollowResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'ログインが必要です。' }
  }

  if (user.id === targetUserId) {
    return { success: false, error: '自分自身はフォローできません。' }
  }

  const { data: existingFollow, error: selectError } = await supabase
    .from('follows')
    .select('id')
    .eq('follower', user.id)
    .eq('follow', targetUserId)
    .maybeSingle()

  if (selectError) {
    console.error('FOLLOW SELECT ERROR:', selectError)
    return { success: false, error: 'フォロー状態を取得できませんでした。' }
  }

  if (existingFollow) {
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('id', existingFollow.id)

    if (deleteError) {
      console.error('FOLLOW DELETE ERROR:', deleteError)
      return { success: false, error: 'フォローを解除できませんでした。' }
    }

    revalidateFollowViews()
    return { success: true, following: false }
  }

  const { error: insertError } = await supabase.from('follows').insert({
    follower: user.id,
    follow: targetUserId,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      revalidateFollowViews()
      return { success: true, following: true }
    }

    console.error('FOLLOW INSERT ERROR:', insertError)
    return { success: false, error: 'フォローできませんでした。' }
  }

  revalidateFollowViews()
  return { success: true, following: true }
}
