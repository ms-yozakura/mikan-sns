'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import defaultAvatar from '@/img/default-avatar.jpg'
import { markNotificationsRead } from '../actions/markNotificationsRead'
import styles from './NotificationsList.module.css'

type Actor = {
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

type Comment = { body: string | null }

type NotificationItem = {
  id: string
  type: string
  post_id: string | null
  is_read: boolean
  created_at: string
  actor: Actor | Actor[] | null
  comments: Comment | Comment[] | null
}

const notificationCopy = {
  like: { icon: 'mdi:heart', text: 'あなたの投稿にいいねしました' },
  comment: { icon: 'mdi:comment-text', text: 'あなたの投稿にコメントしました' },
  follow: { icon: 'mdi:account-plus', text: 'あなたをフォローしました' },
} as const

type BadgeNavigator = Navigator & {
  clearAppBadge?: () => Promise<void>
}

export function NotificationsList({ notifications }: { notifications: NotificationItem[] }) {
  useEffect(() => {
    const syncReadState = async () => {
      if (notifications.some((notification) => !notification.is_read)) {
        await markNotificationsRead()
      }

      const badgeNavigator = navigator as BadgeNavigator
      if (badgeNavigator.clearAppBadge) {
        try {
          await badgeNavigator.clearAppBadge()
        } catch (error) {
          console.error('CLEAR APP BADGE ERROR:', error)
        }
      }
    }

    void syncReadState()
  }, [notifications])

  if (notifications.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon icon="mdi:bell-outline" aria-hidden="true" />
        <p>まだ通知はありません</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {notifications.map((notification) => {
        const actor = Array.isArray(notification.actor) ? notification.actor[0] : notification.actor
        const comment = Array.isArray(notification.comments) ? notification.comments[0] : notification.comments
        const copy = notificationCopy[notification.type as keyof typeof notificationCopy] ?? {
          icon: 'mdi:bell',
          text: '新しいお知らせがあります',
        }
        const targetHref = notification.post_id
          ? `/post/${notification.post_id}`
          : `/user/${actor?.username ?? ''}`
        const actorHref = `/user/${actor?.username ?? ''}`
        const formattedDate = new Date(notification.created_at).toLocaleString('ja-JP', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <article
            key={notification.id}
            className={`${styles.item} ${notification.is_read ? '' : styles.unread}`}
          >
            <Link
              href={targetHref}
              className={styles.targetLink}
              aria-label={notification.post_id ? '対象の投稿を見る' : 'ユーザーを見る'}
            />

            <Link
              href={actorHref}
              className={styles.avatarWrap}
              aria-label={`${actor?.display_name || 'ユーザー'}のプロフィールを見る`}
            >
              <img src={actor?.avatar_url ?? defaultAvatar.src} alt="" className={styles.avatar} />
              <span className={`${styles.typeIcon} ${styles[notification.type] ?? ''}`}>
                <Icon icon={copy.icon} aria-hidden="true" />
              </span>
            </Link>

            <div className={styles.content}>
              <p>
                <Link href={actorHref} className={styles.actorName}>
                  {actor?.display_name || '名無しの柑橘'}
                </Link>
                さんが{copy.text}
              </p>
              {notification.type === 'comment' && comment?.body && (
                <p className={styles.commentPreview}>{comment.body}</p>
              )}
              <time dateTime={notification.created_at}>{formattedDate}</time>
            </div>

            {!notification.is_read && <span className={styles.unreadDot} aria-label="未読" />}
          </article>
        )
      })}
    </div>
  )
}
