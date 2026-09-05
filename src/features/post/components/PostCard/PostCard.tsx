'use client'

import styles from './PostCard.module.css'
import { useModal } from '@/providers/ModalProvider'
import MikanTag from '@/features/mikan/components/MikanTag'
import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import Button from '@/shared/ui/Button'
import { createComment } from '../../actions/createComment'
import { toggleReaction } from '../../actions/toggleReaction'
import {
  REACTIONS,
  createReactionCounts,
  type ReactionCounts,
  type ReactionType,
} from '../../reactions'
import { Icon } from '@iconify/react'
import defaultAvatar from '@/img/default-avatar.jpg'
import MikanRadar from '../MikanRadar'
import { readMikanProfile } from '../../types/mikanProfile'

export function PostCard({
  post,
  enableCommentForm = true,
  enablePostLink = true,
}: {
  post: any
  enableCommentForm?: boolean
  enablePostLink?: boolean
}) {
  const formattedDate = new Date(post.created_at).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const { openModal } = useModal()

  const [commentFormDisp, setCommentFormDisp] = useState(false)
  const [reactionByMe, setReactionByMe] = useState<ReactionType | null>(
    post.reaction_by_me ?? (post.liked_by_me ? 'like' : null)
  )
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>(() => ({
    ...createReactionCounts(),
    ...(post.reaction_counts ?? { like: Number(post.like_count ?? post.post_likes?.[0]?.count ?? 0) }),
  }))
  const [reactionPending, setReactionPending] = useState(false)
  const [reactionError, setReactionError] = useState<string | null>(null)

  const [state, action, pending] = useActionState(createComment, null)

  const avatarUrl = post.users?.avatar_url || null
  const mikanEntries = (post.post_mikans ?? []).map((value: any) => ({
    value,
    profile: readMikanProfile(value),
  }))
  const reviewedMikans = mikanEntries.filter((entry: any) => entry.profile !== null)
  const simpleMikans = mikanEntries.filter((entry: any) => entry.profile === null)

  useEffect(() => {
    if (state?.success) {
      setCommentFormDisp(false)
    }
  }, [state])

  const handleReaction = async (reaction: ReactionType) => {
    if (reactionPending) return

    const previousReaction = reactionByMe
    const previousCounts = { ...reactionCounts }
    const nextReaction = previousReaction === reaction ? null : reaction
    const nextCounts = { ...previousCounts }

    if (previousReaction) {
      nextCounts[previousReaction] = Math.max(0, nextCounts[previousReaction] - 1)
    }
    if (nextReaction) {
      nextCounts[nextReaction] += 1
    }

    setReactionError(null)
    setReactionByMe(nextReaction)
    setReactionCounts(nextCounts)
    setReactionPending(true)

    const result = await toggleReaction(post.id, reaction)

    if (!result.success) {
      setReactionByMe(previousReaction)
      setReactionCounts(previousCounts)
      setReactionError(result.error)
      setReactionPending(false)
      return
    }

    if (result.reaction !== nextReaction) {
      setReactionByMe(result.reaction)
      setReactionCounts(previousCounts)
    }

    setReactionPending(false)
  }

  return (
    <article className={styles.postCard}>
      {enablePostLink && (
        <Link className={styles.cardLink} href={`/post/${post.id}`}></Link>
      )}

      <div className={styles.postHeader}>
        <Link
          href={`/user/${post.users?.username}`}
          onClick={(e) => {
            e.stopPropagation()
          }}
          className={styles.avatarWrapper}
        >
          <img
            src={avatarUrl ?? defaultAvatar.src}
            alt={`${post.users?.display_name}'s avatar`}
            className={styles.avatarImage}
          />
        </Link>
        <Link
          href={`/user/${post.users?.username}`}
          onClick={(e) => {
            e.stopPropagation()
          }}
          className={styles.postUserInfo}
        >
          <div className={styles.nameContainer}>
            <h3 className={styles.postAuthor}>
              {post.users?.display_name || '名無しの柑橘'}
            </h3>
            <span className={styles.postUsername}>@{post.users?.username || 'user'}</span>
          </div>
          <span className={styles.postDate}>{formattedDate}</span>
        </Link>
        {post.visibility != 'public' && (
          <div className={styles.visibilityTag}>{post.visibility}</div>
        )}
      </div>

      <div className={styles.postBody}>
        <p>{post.body}</p>
      </div>

      <div className={styles.imageArea}>
        {post.post_images?.some((img: any) => img.thumbnail_url) && (
          <>
            {post.post_images.map((img: any) => {
              if (!img.thumbnail_url) return null

              return (
                <img
                  key={img.thumbnail_url}
                  src={img.thumbnail_url}
                  className={styles.image}
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal({
                      children: (
                        <div className={styles.imageModalBody}>
                          <img src={img.url} className={styles.bigImage} />
                        </div>
                      ),
                    })
                  }}
                />
              )
            })}
          </>
        )}
      </div>

      <div className={styles.mikanList}>
        {reviewedMikans.map(({ value, profile }: any) => (
          <div key={value.id} className={`${styles.mikanEntry} ${styles.withRadar}`}>
            <MikanTag
              mikan={{
                name: value.mikan_varieties.name,
                quantity: value.quantity,
                satisfaction: value.satisfaction,
              }}
              variety={value.mikan_varieties}
            />
            <MikanRadar title="" values={profile} compact className={styles.mikanRadar} />
          </div>
        ))}
        {simpleMikans.length > 0 && (
          <div className={styles.simpleMikanColumn}>
            {simpleMikans.map(({ value }: any) => (
              <MikanTag
                key={value.id}
                slim
                mikan={{
                  name: value.mikan_varieties.name,
                  quantity: value.quantity,
                  satisfaction: value.satisfaction,
                }}
                variety={value.mikan_varieties}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.postFooter}>
        <button
          className={`${styles.actionButton} ${styles.commentBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            setCommentFormDisp(true)
          }}
          aria-label="コメント"
        >
          <Icon className={styles.footerIcon} icon="iconamoon:comment" />
          <span className={styles.actionCount}>{post.comments?.[0]?.count ?? 0}</span>
        </button>

        <div className={styles.reactionGroup} aria-label="リアクション">
          {REACTIONS.map((reaction) => {
            const active = reactionByMe === reaction.type
            return (
              <button
                key={reaction.type}
                className={`${styles.actionButton} ${styles.reactionButton} ${active ? styles.reactionActive : ''}`}
                data-reaction={reaction.type}
                onClick={(e) => {
                  e.stopPropagation()
                  void handleReaction(reaction.type)
                }}
                aria-label={`${reaction.label}${active ? 'を解除' : ''}`}
                aria-pressed={active}
                title={reaction.label}
                disabled={reactionPending}
              >
                <Icon
                  className={styles.footerIcon}
                  icon={active ? reaction.activeIcon : reaction.icon}
                />
                <span className={styles.actionCount}>{reactionCounts[reaction.type]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {reactionError && (
        <p className={styles.actionError} role="status">
          {reactionError}
        </p>
      )}

      {commentFormDisp && enableCommentForm && (
        <form action={action} className={styles.commentForm}>
          <input type="hidden" name="postId" value={post.id} />
          <textarea
            name="body"
            placeholder="コメントを入力"
            autoFocus
            onBlur={() => setTimeout(() => setCommentFormDisp(false), 100)}
          />
          <Button size="s" type="submit" disabled={pending}>
            送信
          </Button>
        </form>
      )}
    </article>
  )
}
