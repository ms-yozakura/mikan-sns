'use server'

import { createClient } from '@/infrastructure/supabase/server'


// 該当の日付とIDよりも前の投稿を取得するための関数


type Cursor = {
  id: number | string
  created_at: string
}

export async function getFeed(cursor?: Cursor, limit:number=10) {
  const supabase = await createClient()

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
        mikan_varieties(
          name,
          color,
          shape
        )
      ),
      comments(count)
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

  return data
}
