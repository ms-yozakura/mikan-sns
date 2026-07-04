'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/features/auth/actions/login'
import { LoginForm } from '../components/LoginForm'
import AuthLayout from '../components/AuthLayout'
import Message from '@/shared/ui/Message'
import styles from './LoginPage.module.css'

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

  // ログイン成功したらホームへ移動
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 1500) // ログインは少し早めの1.5秒で遷移

      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  return (
    <AuthLayout
      title="みかんSNS"
      subtitle="おかえりなさい！ログインして始めよう。"
    >
      {/*メッセージ*/}
      {state.error && (
        <Message type="error">
          {"⚠️" + state.error}
        </Message>
      )}

      {state.success && (
        <Message type="success">
          ✅️ログインしました！
        </Message>
      )}

      {/*フォーム*/}
      {!state.success && (
        <LoginForm
          formAction={formAction}
          pending={pending}
        />
      )}
    </AuthLayout>)
}

