import Link from 'next/link'
import styles from './authForm.module.css'
import Button from '@/shared/ui/Button'
import TextField from '@/shared/ui/TextField'

type Props = {
  formAction: (formData: FormData) => void
  pending: boolean
  defaultValue: {
    name: string
    username: string
    email: string
    password: string
  }
}

export function SignupForm({
  formAction,
  pending,
  defaultValue,
}: Props) {
  return (
    <form action={formAction}>
      <TextField
        label="名前"
        name="name"
        type="text"
        placeholder="みかん 柑吉"
        defaultValue={defaultValue.name}
        autoComplete="name"
        required
      />
      <TextField
        label="ユーザーID"
        name="username"
        type="text"
        placeholder="kankichi_mikan"
        defaultValue={defaultValue.username}
        autoComplete="nickname"
        required
      />
      <TextField
        label="メールアドレス"
        name="email"
        type="email"
        placeholder="mikan@example.com"
        defaultValue={defaultValue.email}
        autoComplete="username"
        required
      />
      <TextField
        label="パスワード"
        name="password"
        type="password"
        placeholder="••••••••"
        defaultValue={defaultValue.password}
        autoComplete="new-password"
        required
      />
      <TextField
        label="パスワード（確認）"
        name="passwordConfirm"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? '登録中...' : 'アカウントを作成する'}
      </Button>

      <div className={styles.redirectBox}>
        <Link href="/login" className={styles.redirectLink}>
          登録済みの方はこちら
        </Link>
      </div>
    </form>
  )
}
