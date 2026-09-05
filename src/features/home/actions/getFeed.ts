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

export type FeedScope = 'all' | 'following'

export async function getFeed(
  cursor?: Cursor,
  limit: number = 10,
  scope: FeedScope = 'all'
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let followedUserIds: string[] | null = null

  if (scope === 'following') {
    if (!user) return []

    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('follow')
      .eq('follower', user.id)

    if (followsError) {
      console.error('GET FOLLOWING FEED FOLLOWS ERROR:', followsError)
      throw followsError
    }

    followedUserIds = (follows ?? []).map((row) => row.follow)
    if (followedUserIds.length === 0) return []
  }

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
        short_comment,
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

  if (scope === 'following' && followedUserIds) {
    query = query
      .eq('visibility', 'public')
      .in('user_id', followedUserIds)
  }

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

  const postIds = data.map((post) => post.id)
  const { data: reactionRows, error: reactionsError } = await supabase
    .from('post_likes')
    .select('post_id, user_id, reaction_type')
    .in('post_id', postIds)

  if (reactionsError) {
    console.error('GET FEED REACTIONS ERROR:', reactionsError)
    throw reactionsError
  }

  const summaries = new Map<
    string,
    { counts: ReturnType<typeof createReactionCounts>; byMe: Set<ReactionType> }
  >()

  for (const post of data) {
    summaries.set(String(post.id), {
      counts: createReactionCounts(),
      byMe: new Set<ReactionType>(),
    })
  }

  for (const row of reactionRows ?? []) {
    if (!isReactionType(row.reaction_type)) continue
    const summary = summaries.get(String(row.post_id))
    if (!summary) continue

    summary.counts[row.reaction_type] += 1
    if (user && row.user_id === user.id) {
      summary.byMe.add(row.reaction_type)
    }
  }

  return data.map((post) => {
    const summary = summaries.get(String(post.id))
    const reactionsByMe = summary ? Array.from(summary.byMe) : []

    return {
      ...post,
      like_count: summary?.counts.like ?? 0,
      liked_by_me: reactionsByMe.includes('like'),
      reaction_counts: summary?.counts ?? createReactionCounts(),
      reactions_by_me: reactionsByMe,
      reaction_by_me: reactionsByMe[0] ?? null,
    }
  })
}
