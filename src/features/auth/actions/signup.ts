'use server'

import { createClient } from '@/infrastructure/supabase/server'

import { validatePassword, validateUsername } from '../lib/validation'

export async function signUp(
  prevState: {
    error: string
    success: boolean
    value: {
      name: string
      username: string
      email: string
      password: string
    }
  },
  formData: FormData

) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string


  const usernameError = validateUsername(username)

  if (usernameError) {
    return {
      success: false,
      error: usernameError,
      value: {
        name,
        username: "",
        email,
        password:''
      }
    }
  }

  const passwordError = validatePassword(password)

  if (passwordError) {
    return {
      success: false,
      error: passwordError,
      value: {
        name,
        username,
        email,
        password: ""
      }

    }
  }

  // username重複チェック
  const { data: existingUser, error: searchError } =
    await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

  if (searchError) {
    return {
      success: false,
      error: 'failed to check username',
      value: {
        name,
        username: "",
        email,
        password:''
      }

    }
  }

  if (existingUser) {
    return {
      success: false,
      error: 'username already taken',
      value: {
        name,
        username: "",
        email,
        password:''
      }

    }
  }
  
  const { error: error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: name,
      },
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message,
      value: {
        name,
        username,
        email,
        password:''
      }
    }
  }

  return {
    success: true,
    error: "",
    value: {
      name,
      username,
      email,
      password:''
    }

  }
}
