'use server'

import { createClient } from '@/infrastructure/supabase/server'
import {
  createReactionCounts,
  isReactionType,
  type ReactionType,
} from '@/features/post/reactions'

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

  const summaries = new Map<
    string,
    { counts: ReturnType<typeof createReactionCounts>; byMe: ReactionType | null }
  >()

  if (posts?.length) {
    for (const post of posts) {
      summaries.set(String(post.id), {
        counts: createReactionCounts(),
        byMe: null,
      })
    }

    const { data: reactionRows, error: reactionsError } = await supabase
      .from('post_likes')
      .select('post_id, user_id, reaction_type')
      .in(
        'post_id',
        posts.map((post) => post.id)
      )

    if (reactionsError) {
      console.error('GET USER FEED REACTIONS ERROR:', reactionsError)
      throw new Error(reactionsError.message)
    }

    for (const row of reactionRows ?? []) {
      if (!isReactionType(row.reaction_type)) continue
      const summary = summaries.get(String(row.post_id))
      if (!summary) continue

      summary.counts[row.reaction_type] += 1
      if (user && row.user_id === user.id) {
        summary.byMe = row.reaction_type
      }
    }
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

  const postsWithReactionState = (posts ?? []).map((post) => {
    const summary = summaries.get(String(post.id))

    return {
      ...post,
      like_count: summary?.counts.like ?? post.post_likes?.[0]?.count ?? 0,
      liked_by_me: summary?.byMe === 'like',
      reaction_counts: summary?.counts ?? createReactionCounts(),
      reaction_by_me: summary?.byMe ?? null,
    }
  })

  return {
    profile,
    posts: postsWithReactionState,
    social: {
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
      isFollowing,
    },
  }
}
