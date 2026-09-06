'use server'

import { createClient } from '@/infrastructure/supabase/server'
import {
  createReactionCounts,
  isReactionType,
  type ReactionType,
} from '@/features/post/reactions'

export async function getReactedPosts({
  username,
  limit = 24,
}: {
  username: string
  limit?: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (profileError || !profile) return []

  const { data: reactedRows, error: reactedError } = await supabase
    .from('post_likes')
    .select('post_id, created_at')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(limit * 4)

  if (reactedError) {
    console.error('GET REACTED POSTS ERROR:', reactedError)
    throw new Error(reactedError.message)
  }

  const reactionOrder = new Map<string, number>()
  for (const row of reactedRows ?? []) {
    const postId = String(row.post_id)
    if (!reactionOrder.has(postId)) {
      reactionOrder.set(postId, reactionOrder.size)
    }
    if (reactionOrder.size >= limit) break
  }

  const postIds = Array.from(reactionOrder.keys())
  if (postIds.length === 0) return []

  const { data: posts, error: postsError } = await supabase
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
    .in('id', postIds)

  if (postsError) {
    console.error('GET REACTED POST DATA ERROR:', postsError)
    throw new Error(postsError.message)
  }

  const summaries = new Map<
    string,
    { counts: ReturnType<typeof createReactionCounts>; byMe: Set<ReactionType> }
  >()

  for (const post of posts ?? []) {
    summaries.set(String(post.id), {
      counts: createReactionCounts(),
      byMe: new Set<ReactionType>(),
    })
  }

  if (posts?.length) {
    const { data: reactionRows, error: reactionsError } = await supabase
      .from('post_likes')
      .select('post_id, user_id, reaction_type')
      .in(
        'post_id',
        posts.map((post) => post.id)
      )

    if (reactionsError) {
      console.error('GET REACTED POSTS REACTIONS ERROR:', reactionsError)
      throw new Error(reactionsError.message)
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
  }

  return (posts ?? [])
    .map((post) => {
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
    .sort(
      (a, b) =>
        (reactionOrder.get(String(a.id)) ?? Number.MAX_SAFE_INTEGER) -
        (reactionOrder.get(String(b.id)) ?? Number.MAX_SAFE_INTEGER)
    )
}
