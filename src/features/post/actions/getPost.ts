'use server'

import { createClient } from '@/infrastructure/supabase/server'
import {
  createReactionCounts,
  isReactionType,
  type ReactionType,
} from '../reactions'

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

  const { data: reactionRows, error: reactionsError } = await supabase
    .from('post_likes')
    .select('user_id, reaction_type')
    .eq('post_id', postId)

  if (reactionsError) {
    console.error('GET POST REACTIONS ERROR:', reactionsError)
    throw new Error(reactionsError.message)
  }

  const reactionCounts = createReactionCounts()
  let reactionByMe: ReactionType | null = null

  for (const row of reactionRows ?? []) {
    if (!isReactionType(row.reaction_type)) continue
    reactionCounts[row.reaction_type] += 1
    if (user && row.user_id === user.id) {
      reactionByMe = row.reaction_type
    }
  }

  console.timeEnd('getPost')
  return {
    ...data,
    like_count: reactionCounts.like,
    liked_by_me: reactionByMe === 'like',
    reaction_counts: reactionCounts,
    reaction_by_me: reactionByMe,
  }
}
