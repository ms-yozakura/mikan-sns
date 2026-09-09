'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { validatePassword, validateUsername } from '../lib/validation'

type SignupState = {
  error: string
  success: boolean
  value: {
    name: string
    username: string
    email: string
    password: string
  }
}

export async function signUp(
  prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string

  const usernameError = validateUsername(username)

  if (usernameError) {
    return {
      success: false,
      error: usernameError,
      value: { name, username: '', email, password: '' },
    }
  }

  const passwordError = validatePassword(password)

  if (passwordError) {
    return {
      success: false,
      error: passwordError,
      value: { name, username, email, password: '' },
    }
  }

  if (password !== passwordConfirm) {
    return {
      success: false,
      error: 'パスワードが一致しません',
      value: { name, username, email, password: '' },
    }
  }

  const { data: existingUser, error: searchError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (searchError) {
    return {
      success: false,
      error: 'failed to check username',
      value: { name, username: '', email, password: '' },
    }
  }

  if (existingUser) {
    return {
      success: false,
      error: 'username already taken',
      value: { name, username: '', email, password: '' },
    }
  }

  const { data, error } = await supabase.auth.signUp({
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
      value: { name, username, email, password: '' },
    }
  }

  // Confirm-email projects intentionally return an obfuscated user instead of
  // an error for an already registered address. A newly created password user
  // has an email identity attached, while that obfuscated response does not.
  if (!data.user?.identities?.length) {
    return {
      success: false,
      error: 'このメールアドレスはすでに登録されています。ログインしてください。',
      value: { name, username, email, password: '' },
    }
  }

  return {
    success: true,
    error: '',
    value: { name, username, email, password: '' },
  }
}
