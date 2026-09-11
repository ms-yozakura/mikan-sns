'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { login } from '@/features/auth/actions/login'
import { LoginForm } from '../components/LoginForm'
import AuthLayout from '../components/AuthLayout'
import Message from '@/shared/ui/Message'

const initialState = {
  error: '',
  success: false,
}

export function LoginPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    login,
    initialState
  )

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/home')
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  return (
    <AuthLayout subtitle="おかえりなさい！ログインして始めよう。">
      {state.error && (
        <Message type="error">
          {"⚠️" + state.error}
        </Message>
      )}

      {state.success && (
        <Message type="success">
          <Icon icon="mdi:check-circle" width={20} height={20} aria-hidden="true" />
          <span>ログインしました！</span>
        </Message>
      )}

      {!state.success && (
        <LoginForm
          formAction={formAction}
          pending={pending}
        />
      )}
    </AuthLayout>
  )
}
