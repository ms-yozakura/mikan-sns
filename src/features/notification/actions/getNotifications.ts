'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      post_id,
      is_read,
      created_at,
      actor:users!notifications_actor_id_fkey (
        username,
        display_name,
        avatar_url
      ),
      comments (
        body
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('GET NOTIFICATIONS ERROR:', error)
    throw new Error('通知を取得できませんでした。')
  }

  return data ?? []
}

