'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function getPost(postId: string) {
  console.time('getPost')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (
        username,
        display_name,
        avatar_url
      ),
      post_images (
        url,
        thumbnail_url,
        order_index
      ),
      post_mikans(
        id,
        quantity,
        satisfaction,
        sweetness,
        tartness,
        umami,
        juiciness,
        thinness,
        aroma,
        texture,
        mikan_varieties(
          name,
          color,
          shape
        )
      ),
      comments(count),
      post_likes(count)
    `)
    .eq('id', postId)
    .maybeSingle()

  if (error) {
    console.error('GET POST ERROR:', error)
    throw new Error(error.message)
  }

  if (!data) {
    console.timeEnd('getPost')
    return data
  }

  let likedByMe = false

  if (user) {
    const { data: likedRow, error: likeError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (likeError) {
      console.error('GET POST LIKE ERROR:', likeError)
      throw new Error(likeError.message)
    }

    likedByMe = Boolean(likedRow)
  }

  console.timeEnd('getPost')
  return {
    ...data,
    like_count: data.post_likes?.[0]?.count ?? 0,
    liked_by_me: likedByMe,
  }
}
