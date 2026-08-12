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

  const { data: profile } = await supabase
    .from("users")
    .select(`
      *,
      profiles(
        bio,
        region,
        generation
      )
    `)
    .eq("username", username)
    .single()

  if (!profile) return;

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
      comments(count)
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
    console.error('GET FEED ERROR:', error)
    throw new Error(error.message)
  }

  return { profile, posts }
}
