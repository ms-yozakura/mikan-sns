'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function getUserFeed({ username }: { username: string }) {
  const supabase = await createClient()
  console.log("getUserFeed")

  const { data: profile } = await supabase
    .from("users")
    .select(`
      id,
      display_name,
      username,
      avatar_url,
      profiles(
        bio,
        region,
        generation
      )
    `)
    .eq("username", username)
    .single()

  if (!profile) return;

  const { data: posts, error } = await supabase
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
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  //console.log(posts)

  if (error) {
    console.log('GET FEED ERROR:', error)
    throw new Error(error.message)
  }

  return { profile, posts }
}
