'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { deleteAccount } from '../actions/deleteAccount'
import styles from '../pages/SettingPage.module.css'

export function DeleteAccountButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (pending) return

    setPending(true)
    setError(null)

    const result = await deleteAccount()

    if (!result.success) {
      setError(result.error || 'アカウントを削除できませんでした。')
      setPending(false)
      return
    }

    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      <button type="button" className={styles.dangerButton} onClick={() => setOpen(true)}>
        <Icon icon="mdi:delete-outline" aria-hidden="true" />
        アカウントを削除
      </button>

      {open && (
        <div className={styles.deleteBackdrop} role="presentation" onMouseDown={() => !pending && setOpen(false)}>
          <div
            className={styles.deleteDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.deleteDialogIcon}>
              <Icon icon="mdi:alert-circle-outline" aria-hidden="true" />
            </div>
            <h3 id="delete-account-title" className={styles.deleteDialogTitle}>アカウントを削除しますか？</h3>
            <p className={styles.deleteDialogText}>
              投稿、コメント、リアクション、プロフィール、画像を含むすべてのデータが完全に削除されます。この操作は取り消せません。
            </p>

            {error && <p className={styles.deleteError} role="alert">{error}</p>}

            <div className={styles.deleteDialogActions}>
              <button
                type="button"
                className={styles.deleteCancelButton}
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className={styles.deleteConfirmButton}
                disabled={pending}
                onClick={() => void handleDelete()}
              >
                <Icon icon="mdi:delete-outline" aria-hidden="true" />
                {pending ? '削除中…' : '完全に削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
