// features/auth/components/LoginForm.tsx

import Link from 'next/link'
import styles from './authForm.module.css'
import Button from "@/shared/ui/Button"
import TextField from "@/shared/ui/TextField"

type Props = {
  formAction: (formData: FormData) => void
  pending: boolean
}

export function LoginForm({
  formAction,
  pending,
}: Props) {
  return (
    <form action={formAction}>
      <TextField
        label="メールアドレス"
        name="email"
        type="email"
        placeholder="mikan@example.com"
        required
      />

      <TextField
        label="パスワード"
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />

      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? 'ログイン中...' : 'ログインする'}
      </Button>

      <div className={styles.redirectBox}>
        <Link href="/signup" className={styles.redirectLink}>
          初めての方はこちら（アカウント作成）
        </Link>
      </div>
    </form>
  )
}
