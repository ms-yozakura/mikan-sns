'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      error: error.message,
      success: false,
    }
  }

  return {
    error: "",
    success: true,
  }
}
