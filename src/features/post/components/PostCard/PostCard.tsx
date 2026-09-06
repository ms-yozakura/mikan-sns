'use client'

import styles from './PostCard.module.css'
import { useModal } from '@/providers/ModalProvider'
import Link from 'next/link'
import { useActionState, useEffect, useMemo, useState } from 'react'
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
import { MikanIcon } from '@/features/mikan/components/MikanIcon'

const MAX_VISIBLE_MIKAN_ICONS = 8

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
  const [reactionsByMe, setReactionsByMe] = useState<Set<ReactionType>>(() => {
    const initial = Array.isArray(post.reactions_by_me)
      ? post.reactions_by_me
      : post.reaction_by_me
        ? [post.reaction_by_me]
        : post.liked_by_me
          ? ['like']
          : []
    return new Set(initial)
  })
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>(() => ({
    ...createReactionCounts(),
    ...(post.reaction_counts ?? { like: Number(post.like_count ?? post.post_likes?.[0]?.count ?? 0) }),
  }))
  const [reactionPending, setReactionPending] = useState(false)
  const [reactionError, setReactionError] = useState<string | null>(null)

  const [state, action, pending] = useActionState(createComment, null)

  const avatarUrl = post.users?.avatar_url || null
  const images = (post.post_images ?? []).filter((img: any) => img.thumbnail_url).slice(0, 4)
  const allImageCount = (post.post_images ?? []).filter((img: any) => img.thumbnail_url).length
  const mikanEntries = (post.post_mikans ?? []).map((value: any) => ({
    value,
    profile: readMikanProfile(value),
  }))
  const detailMikans = mikanEntries.filter(
    (entry: any) => entry.profile !== null || Boolean(entry.value.short_comment)
  )
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(
    detailMikans[0]?.value.id ?? null
  )
  const selectedDetail =
    detailMikans.find((entry: any) => entry.value.id === selectedDetailId) ?? detailMikans[0] ?? null

  const totalQuantity = mikanEntries.reduce(
    (sum: number, entry: any) => sum + Math.max(0, Number(entry.value.quantity ?? 0)),
    0
  )

  const visibleMikanIcons = useMemo(() => {
    const result: Array<{ key: string; color: string; shape: string }> = []
    for (const { value } of mikanEntries) {
      const quantity = Math.max(0, Number(value.quantity ?? 0))
      for (let index = 0; index < quantity && result.length < MAX_VISIBLE_MIKAN_ICONS; index += 1) {
        result.push({
          key: `${value.id}-${index}`,
          color: value.mikan_varieties?.color ?? '#ff9800',
          shape: value.mikan_varieties?.shape ?? 'unknown',
        })
      }
      if (result.length >= MAX_VISIBLE_MIKAN_ICONS) break
    }
    return result
  }, [post.post_mikans])

  useEffect(() => {
    if (state?.success) {
      setCommentFormDisp(false)
    }
  }, [state])

  useEffect(() => {
    if (!detailMikans.length) {
      setSelectedDetailId(null)
      return
    }
    if (!detailMikans.some((entry: any) => entry.value.id === selectedDetailId)) {
      setSelectedDetailId(detailMikans[0].value.id)
    }
  }, [post.post_mikans, selectedDetailId])

  const handleReaction = async (reaction: ReactionType) => {
    if (reactionPending) return

    const previousActive = reactionsByMe.has(reaction)
    const previousReactions = new Set(reactionsByMe)
    const previousCounts = { ...reactionCounts }
    const nextReactions = new Set(previousReactions)
    const nextCounts = { ...previousCounts }

    if (previousActive) {
      nextReactions.delete(reaction)
      nextCounts[reaction] = Math.max(0, nextCounts[reaction] - 1)
    } else {
      nextReactions.add(reaction)
      nextCounts[reaction] += 1
    }

    setReactionError(null)
    setReactionsByMe(nextReactions)
    setReactionCounts(nextCounts)
    setReactionPending(true)

    const result = await toggleReaction(post.id, reaction)

    if (!result.success) {
      setReactionsByMe(previousReactions)
      setReactionCounts(previousCounts)
      setReactionError(result.error)
      setReactionPending(false)
      return
    }

    if (result.active !== !previousActive) {
      const corrected = new Set(previousReactions)
      if (result.active) corrected.add(reaction)
      else corrected.delete(reaction)
      setReactionsByMe(corrected)
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
          onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => e.stopPropagation()}
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

      {images.length > 0 && (
        <div className={styles.imageArea} data-count={images.length}>
          {images.map((img: any, index: number) => (
            <button
              key={img.thumbnail_url}
              type="button"
              className={styles.imageButton}
              data-index={index}
              onClick={(e) => {
                e.stopPropagation()
                openModal({
                  children: (
                    <div className={styles.imageModalBody}>
                      <img src={img.url} className={styles.bigImage} alt="投稿画像" />
                    </div>
                  ),
                })
              }}
            >
              <img src={img.thumbnail_url} className={styles.image} alt="投稿画像のプレビュー" />
              {index === 3 && allImageCount > 4 && (
                <span className={styles.imageOverflow}>+{allImageCount - 4}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {mikanEntries.length > 0 && (
        <section className={styles.mikanSummary} onClick={(e) => e.stopPropagation()}>
          <div className={styles.mikanSummaryHeader}>
            <h4>食べたみかん</h4>
            <span className={styles.totalQuantity}>合計 {totalQuantity}個</span>
          </div>

          <div className={styles.quantityIcons} aria-label={`食べた個数 ${totalQuantity}個`}>
            {visibleMikanIcons.map((icon) => (
              <MikanIcon
                key={icon.key}
                color={icon.color}
                shape={icon.shape as any}
                size={27}
              />
            ))}
            {totalQuantity > MAX_VISIBLE_MIKAN_ICONS && (
              <span className={styles.quantityOverflow}>+{totalQuantity - MAX_VISIBLE_MIKAN_ICONS}</span>
            )}
          </div>

          <div className={styles.varietyGrid}>
            {mikanEntries.map(({ value }: any) => (
              <div key={value.id} className={styles.varietyChip}>
                <MikanIcon
                  color={value.mikan_varieties?.color ?? '#ff9800'}
                  shape={value.mikan_varieties?.shape ?? 'unknown'}
                  size={25}
                />
                <span className={styles.varietyName}>{value.mikan_varieties?.name ?? 'みかん'}</span>
                <strong>{value.quantity}個</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {detailMikans.length > 0 && (
        <details className={styles.detailEvaluation} onClick={(e) => e.stopPropagation()}>
          <summary>
            <span>詳細評価を表示</span>
            <Icon icon="mdi:chevron-down" className={styles.detailChevron} aria-hidden="true" />
          </summary>

          <div className={styles.detailTabs} role="tablist" aria-label="品種ごとの詳細評価">
            {detailMikans.map(({ value }: any) => {
              const active = selectedDetail?.value.id === value.id
              return (
                <button
                  key={value.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`${styles.detailTab} ${active ? styles.detailTabActive : ''}`}
                  onClick={() => setSelectedDetailId(value.id)}
                >
                  <MikanIcon
                    color={value.mikan_varieties?.color ?? '#ff9800'}
                    shape={value.mikan_varieties?.shape ?? 'unknown'}
                    size={20}
                  />
                  <span>{value.mikan_varieties?.name ?? 'みかん'}</span>
                </button>
              )
            })}
          </div>

          {selectedDetail && (
            <div className={styles.detailPanel}>
              <div className={styles.radarPanel}>
                {selectedDetail.profile ? (
                  <MikanRadar
                    title=""
                    values={selectedDetail.profile}
                    compact
                    className={styles.mikanRadar}
                  />
                ) : (
                  <p className={styles.noRadar}>レーダー評価はありません</p>
                )}
              </div>
              <div className={styles.detailCommentPanel}>
                <span className={styles.detailLabel}>一言感想</span>
                <p>{selectedDetail.value.short_comment || '感想はありません'}</p>
                <span className={styles.satisfactionBadge}>
                  <Icon icon="mdi:star" aria-hidden="true" />
                  満足度 {selectedDetail.value.satisfaction}/5
                </span>
              </div>
            </div>
          )}
        </details>
      )}

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

        <span className={styles.actionDivider} aria-hidden="true" />

        <div className={styles.reactionGroup} aria-label="リアクション">
          {REACTIONS.map((reaction) => {
            const active = reactionsByMe.has(reaction.type)
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
