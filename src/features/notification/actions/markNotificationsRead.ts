'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'

export async function markNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('MARK NOTIFICATIONS READ ERROR:', error)
    return
  }

  revalidatePath('/notifications')
}

