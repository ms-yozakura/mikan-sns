'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'

export type DeletePostResult =
  | { success: true }
  | { success: false; error: string }

export async function deletePost(postId: string): Promise<DeletePostResult> {
  if (!postId) {
    return { success: false, error: '投稿IDが不正です' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'ログインしてください' }
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, user_id, post_images(order_index)')
    .eq('id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (postError) {
    console.error('GET POST FOR DELETE ERROR:', postError)
    return { success: false, error: '投稿の確認に失敗しました' }
  }

  if (!post) {
    return { success: false, error: '削除できる投稿が見つかりません' }
  }

  const { data: deletedPost, error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (deleteError) {
    console.error('DELETE POST ERROR:', deleteError)
    return { success: false, error: '投稿の削除に失敗しました' }
  }

  if (!deletedPost) {
    return { success: false, error: '投稿を削除できませんでした' }
  }

  const imagePaths = (post.post_images ?? []).flatMap((image) => {
    const index = Number(image.order_index)
    if (!Number.isInteger(index) || index < 0) return []
    return [
      `${user.id}/${postId}/${index}.webp`,
      `${user.id}/${postId}/${index}_thumb.webp`,
    ]
  })

  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('post_images').remove(imagePaths)
    if (storageError) {
      console.error('DELETE POST STORAGE ERROR:', storageError)
    }
  }

  revalidatePath('/home')
  revalidatePath('/calendar')
  revalidatePath('/stats')
  revalidatePath('/user/[username]', 'page')
  revalidatePath('/post/[id]', 'page')

  return { success: true }
}
