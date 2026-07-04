'use client'

import { useActionState, useEffect } from 'react' // 💡 useEffect を追加
import { useRouter } from 'next/navigation'        // 💡 useRouter を追加
import Link from 'next/link' // 💡 追加：Link コンポーネントをインポート
import { signUp } from '@/features/auth/actions/signup'
import styles from './SignupPage.module.css' // 💡 追加：CSSファイルを読み込む
import AuthLayout from '../components/AuthLayout'
import Message from '@/shared/ui/Message'
import { SignupForm } from '../components/SignupForm'

const initialState = {
  error: '',
  success: false,
  value:{
    name:"",
    username:"",
    email:"",
    password:""
  }
}

export function SignupPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    signUp,
    initialState
  )

  // 登録成功（state.success が true）したら2秒後にルートにリダイレクト
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  return (

    <AuthLayout
      title='みかんSNS'
      subtitle='フレッシュなつながりを、はじめよう。'
    >
{/*メッセージ*/}
      {state.error && (
        <Message type="error">
          {"⚠️"+state.error}
        </Message>
      )}

      {state.success && (
        <Message type="success">
            🎉 登録成功！
        </Message>
      )}

      {/*フォーム*/}
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

