'use server'

import { createClient } from '@/infrastructure/supabase/server'
import {
  createReactionCounts,
  isReactionType,
  type ReactionType,
} from '@/features/post/reactions'

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
    { counts: ReturnType<typeof createReactionCounts>; byMe: ReactionType | null }
  >()

  for (const post of data) {
    summaries.set(String(post.id), {
      counts: createReactionCounts(),
      byMe: null,
    })
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

  return data.map((post) => {
    const summary = summaries.get(String(post.id))

    return {
      ...post,
      like_count: summary?.counts.like ?? post.post_likes?.[0]?.count ?? 0,
      liked_by_me: summary?.byMe === 'like',
      reaction_counts: summary?.counts ?? createReactionCounts(),
      reaction_by_me: summary?.byMe ?? null,
    }
  })
}
