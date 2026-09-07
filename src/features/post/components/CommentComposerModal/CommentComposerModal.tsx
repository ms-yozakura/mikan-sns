'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Button from '@/shared/ui/Button'
import { useModal } from '@/providers/ModalProvider'
import defaultAvatar from '@/img/default-avatar.jpg'
import { createComment } from '../../actions/createComment'
import styles from './CommentComposerModal.module.css'

export function CommentComposerModal({ post }: { post: any }) {
  const [state, action, pending] = useActionState(createComment, null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { closeModal } = useModal()
  const router = useRouter()

  const formattedDate = new Date(post.created_at).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!state?.success) return
    closeModal()
    router.refresh()
  }, [state])

  return (
    <div className={styles.composer}>
      <div className={styles.heading}>コメント</div>

      <section className={styles.targetPost} aria-label="コメント先の投稿">
        <div className={styles.avatarColumn}>
          <img
            src={post.users?.avatar_url ?? defaultAvatar.src}
            alt=""
            className={styles.avatar}
          />
          <span className={styles.threadLine} aria-hidden="true" />
        </div>

        <div className={styles.postContent}>
          <div className={styles.authorLine}>
            <strong>{post.users?.display_name || '名無しの柑橘'}</strong>
            <span>@{post.users?.username || 'user'}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>
          <p className={styles.postBody}>{post.body}</p>
          <div className={styles.replyingTo}>
            <span>@{post.users?.username || 'user'}</span> さんにコメント
          </div>
        </div>
      </section>

      <form action={action} className={styles.form}>
        <input type="hidden" name="postId" value={post.id} />
        <div className={styles.inputRow}>
          <div className={styles.inputIcon} aria-hidden="true">
            <Icon icon="iconamoon:comment" />
          </div>
          <textarea
            ref={textareaRef}
            name="body"
            placeholder="コメントを入力"
            aria-label="コメントを入力"
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className={styles.footer}>
          <div className={styles.status} role="status">
            {state?.error ?? ''}
          </div>
          <Button size="s" type="submit" disabled={pending}>
            {pending ? '送信中…' : 'コメントする'}
          </Button>
        </div>
      </form>
    </div>
  )
}
