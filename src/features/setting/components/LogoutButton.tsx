'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { logout } from '@/features/auth/actions/logout'
import styles from '../pages/SettingPage.module.css'

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    if (pending) return

    setPending(true)
    setError(null)

    const result = await logout()

    if (!result.success) {
      setError(result.error || 'ログアウトできませんでした。')
      setPending(false)
      return
    }

    router.replace('/login')
    router.refresh()
  }

  return (
    <div className={styles.logoutControl}>
      <button
        type="button"
        className={styles.logoutButton}
        onClick={() => void handleLogout()}
        disabled={pending}
      >
        <Icon icon="mdi:logout" aria-hidden="true" />
        {pending ? 'ログアウト中…' : 'ログアウト'}
      </button>
      {error && <p className={styles.logoutError} role="status">{error}</p>}
    </div>
  )
}
