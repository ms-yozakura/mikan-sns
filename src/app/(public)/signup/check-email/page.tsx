import Link from 'next/link'
import AuthLayout from '@/features/auth/components/AuthLayout'
import Message from '@/shared/ui/Message'

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function SignupCheckEmailPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <AuthLayout subtitle="メール認証をお願いします。">
      <Message type="success">
        確認メールを送信しました。
      </Message>

      <p>
        {email ? `${email} に送信したメール` : '送信したメール'}に記載されたリンクを開いて、登録を完了してください。
      </p>

      <p>
        認証が完了したら、ログインできます。
      </p>

      <Link href="/login">
        ログイン画面へ
      </Link>
    </AuthLayout>
  )
}
