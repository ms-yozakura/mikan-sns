'use server'

import { createClient } from '@/infrastructure/supabase/server'

type Cursor = {
  id: number | string
  created_at: string
}

export async function getUserFeed({
  username,
  cursor,
  limit = 10,
}: {
  username: string
  cursor?: Cursor
  limit?: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select(`
      *,
      profiles(
        bio,
        region,
        generation
      )
    `)
    .eq('username', username)
    .single()

  if (profileError || !profile) return

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
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
  }

  const { data: posts, error } = await query

  if (error) {
    console.error('GET USER FEED ERROR:', error)
    throw new Error(error.message)
  }

  let likedPostIds = new Set<string>()

  if (user && posts?.length) {
    const { data: likedRows, error: likesError } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in(
        'post_id',
        posts.map((post) => post.id)
      )

    if (likesError) {
      console.error('GET USER FEED LIKES ERROR:', likesError)
      throw new Error(likesError.message)
    }

    likedPostIds = new Set((likedRows ?? []).map((row) => row.post_id))
  }

  const { count: followersCount, error: followersError } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follow', profile.id)

  if (followersError) {
    console.error('GET FOLLOWERS COUNT ERROR:', followersError)
    throw new Error(followersError.message)
  }

  const { count: followingCount, error: followingError } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower', profile.id)

  if (followingError) {
    console.error('GET FOLLOWING COUNT ERROR:', followingError)
    throw new Error(followingError.message)
  }

  let isFollowing = false

  if (user && user.id !== profile.id) {
    const { data: followRow, error: followError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower', user.id)
      .eq('follow', profile.id)
      .maybeSingle()

    if (followError) {
      console.error('GET FOLLOW STATE ERROR:', followError)
      throw new Error(followError.message)
    }

    isFollowing = Boolean(followRow)
  }

  const postsWithLikeState = (posts ?? []).map((post) => ({
    ...post,
    like_count: post.post_likes?.[0]?.count ?? 0,
    liked_by_me: likedPostIds.has(post.id),
  }))

  return {
    profile,
    posts: postsWithLikeState,
    social: {
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
      isFollowing,
    },
  }
}
