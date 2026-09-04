'use server'

import { createClient } from '@/infrastructure/supabase/server'

type ToggleLikeResult =
  | { success: true; liked: boolean }
  | { success: false; error: string }

export async function toggleLike(postId: string): Promise<ToggleLikeResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'ログインが必要です。' }
  }

  const { data: existingLike, error: selectError } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('LIKE SELECT ERROR:', selectError)
    return { success: false, error: 'いいねの状態を取得できませんでした。' }
  }

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('id', existingLike.id)

    if (deleteError) {
      console.error('LIKE DELETE ERROR:', deleteError)
      return { success: false, error: 'いいねを解除できませんでした。' }
    }

    return { success: true, liked: false }
  }

  const { error: insertError } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: user.id,
  })

  if (insertError) {
    // 別タブなどから同時に押された場合は、重複制約を最終状態として扱う。
    if (insertError.code === '23505') {
      return { success: true, liked: true }
    }

    console.error('LIKE INSERT ERROR:', insertError)
    return { success: false, error: 'いいねできませんでした。' }
  }

  return { success: true, liked: true }
}
