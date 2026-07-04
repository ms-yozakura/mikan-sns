'use server'

import { createClient } from '@/infrastructure/supabase/server'

export async function login(
  prevState: {
    error: string
    success: boolean
  },
  formData: FormData

) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (error) {
    return {
      error: error.message,
      success:false
    }
  }

  return {
    error:"",
    success: true,
  }
}
