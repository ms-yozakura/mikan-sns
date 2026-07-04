'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function getPost(postId: string) {
  const supabase = await createClient()

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
        mikan_varieties(
          name,
          color,
          shape
        )
      )
    `)
    .eq('id', postId)
    .maybeSingle()

  console.log(data)

  if (error) {
    console.log('GET FEED ERROR:', error)
    throw new Error(error.message)
  }

  return data
}
