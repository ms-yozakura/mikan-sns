'use server'

import { createClient } from '@/infrastructure/supabase/server'

// 該当の日付とIDよりも前の投稿を取得するための関数

type Cursor = {
  id: number | string
  created_at: string
}

export async function getFeed(cursor?: Cursor, limit: number = 10) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
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
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error(error)
    throw error
  }

  if (!data?.length) return data

  let likedPostIds = new Set<string>()

  if (user) {
    const { data: likedRows, error: likesError } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in(
        'post_id',
        data.map((post) => post.id)
      )

    if (likesError) {
      console.error('GET FEED LIKES ERROR:', likesError)
      throw likesError
    }

    likedPostIds = new Set((likedRows ?? []).map((row) => row.post_id))
  }

  return data.map((post) => ({
    ...post,
    like_count: post.post_likes?.[0]?.count ?? 0,
    liked_by_me: likedPostIds.has(post.id),
  }))
}
