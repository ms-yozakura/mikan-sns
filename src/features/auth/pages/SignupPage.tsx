'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/features/auth/actions/signup'
import AuthLayout from '../components/AuthLayout'
import Message from '@/shared/ui/Message'
import { SignupForm } from '../components/SignupForm'

const initialState = {
  error: '',
  success: false,
  value: {
    name: '',
    username: '',
    email: '',
    password: '',
  },
}

export function SignupPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(signUp, initialState)

  useEffect(() => {
    if (state.success) {
      router.replace(`/signup/check-email?email=${encodeURIComponent(state.value.email)}`)
    }
  }, [state.success, state.value.email, router])

  return (
    <AuthLayout subtitle="フレッシュなつながりを、はじめよう。">
      {state.error && (
        <Message type="error">
          {'⚠️' + state.error}
        </Message>
      )}

      {!state.success && (
        <SignupForm
          formAction={formAction}
          pending={pending}
          defaultValue={state.value}
        />
      )}
    </AuthLayout>
  )
}
