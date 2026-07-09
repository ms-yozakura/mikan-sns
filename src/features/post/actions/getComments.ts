'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function getComments(postId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users(
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error('GET COMMENTS ERROR:', error)
    throw new Error(error.message)
  }
  return data
}

