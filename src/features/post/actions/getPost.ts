'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function getPost(postId: string) {
  console.time("getPost")
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
    .eq('id', postId)
    .maybeSingle()


  if (error) {
    console.error('GET FEED ERROR:', error)
    throw new Error(error.message)
  }
  console.timeEnd("getPost")
  return data
}
