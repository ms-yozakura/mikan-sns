'use client'

import { Modal } from "@/shared/ui/Modal"
import styles from "./PostCard.module.css"
import { useRouter } from 'next/navigation'
import { useModal } from "@/providers/ModalProvider"
import { MikanIcon } from "@/features/mikan/components/MikanIcon"
import MikanTag from "@/features/mikan/components/MikanTag"
import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import Button from "@/shared/ui/Button"
import { createComment } from "../../actions/createComment"
import { Icon } from "@iconify/react"

export function PostCard({ post }: { post: any }) {
  const formattedDate = new Date(post.created_at).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const router = useRouter()
  const { openModal, closeModal } = useModal()

  const [commentFormDisp, setCommentFormDisp] = useState(false)

  const [state, action, pending] = useActionState(createComment, null)

  // ユーザーのプロフィール画像URL（なければデフォルト）
  const avatarUrl = post.users?.avatar_url || null

  useEffect(() => {
    if (state?.success) {
      setCommentFormDisp(false)
    }
  }, [state])

  return (
    <article
      className={styles.postCard}
    >
      <Link
        className={styles.cardLink}
        href={`/post/${post.id}`}
      ></Link>
      {/* ヘッダー：アイコンと名前 */}
      <div
        className={styles.postHeader}
      >
        <Link
          href={`/user/${post.users?.username}`}
          onClick={(e) => {
            e.stopPropagation() // カード全体のクリックイベントを抑止
          }}
          className={styles.avatarWrapper}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${post.users?.display_name}'s avatar`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>🍊</div>
          )}
        </Link>
        <Link
          href={`/user/${post.users?.username}`}
          onClick={(e) => {
            e.stopPropagation() // カード全体のクリックイベントを抑止
          }}
          className={styles.postUserInfo}
        >
          <div className={styles.nameContainer}>
            <h3 className={styles.postAuthor}>{post.users?.display_name || '名無しの柑橘'}</h3>
            <span className={styles.postUsername}>@{post.users?.username || 'user'}</span>
          </div>
          <span className={styles.postDate}>{formattedDate}</span>
        </Link>
        {post.visibility != "public" &&
          <div className={styles.visibilityTag}>
            {post.visibility}
          </div>
        }
      </div>

      {/* 本文 */}
      <div className={styles.postBody}>
        <p>{post.body}</p>
      </div>

      <div className={styles.imageArea}>
        {
          post.post_images?.some(
            (img: any) => img.thumbnail_url
          ) && (
            <>
              {
                post.post_images.map((img: any) => {

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
                              <img
                                src={img.url}
                                className={styles.bigImage}
                              />
                            </div>
                          ),
                        })
                      }}
                    />
                  )
                })
              }
            </>
          )
        }
      </div>
      <div className={styles.mikanList}>
        {post.post_mikans?.map((value: any) => (
          <MikanTag key={"aa" + value.id} mikan={
            {
              name: value.mikan_varieties.name,
              quantity: value.quantity,
              satisfaction: value.satisfaction
            }
          } variety={value.mikan_varieties} />
        ))}
      </div>
      {/* フッター：インタラクションボタン */}
      <div className={styles.postFooter}>
        <button
          className={`${styles.actionButton} ${styles.commentBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            // コメント一覧/作成へのモック
            setCommentFormDisp(true)
          }}
          aria-label="コメント"
        >
          <Icon className={styles.footerIcon} icon="iconamoon:comment" />
          <span className={styles.actionCount}>{post.comments?.[0]?.count ?? 0}</span>
        </button>

        <button
          className={`${styles.actionButton} ${styles.likeBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            // いいね処理のモック
          }}
          aria-label="いいね"
        >
          <Icon className={styles.footerIcon} icon="iconamoon:heart" />
          <span className={styles.actionCount}>0</span>
        </button>

        <button
          className={`${styles.actionButton} ${styles.bookmarkBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            // ブックマーク処理のモック
          }}
          aria-label="ブックマーク"
        >
          <Icon className={styles.footerIcon} icon="iconamoon:bookmark" />
        </button>

        <button
          className={`${styles.actionButton} ${styles.shareBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            // シェア処理のモック
          }}
          aria-label="シェア"
        >
          <Icon className={styles.footerIcon} icon="iconamoon:share-1" />
        </button>
      </div>
      {
        commentFormDisp && (
          <form
            action={action}
            className={styles.commentForm}
          >
            <input
              type="hidden"
              name="postId"
              value={post.id}
            />
            <textarea
              name="body"
              placeholder="コメントを入力"
              autoFocus
              onBlur={() =>
                setTimeout(() => setCommentFormDisp(false), 100)
              }
            />
            <Button
              size="s"
              type="submit"
              disabled={pending}
            >
              送信
            </Button>
          </form>
        )
      }
    </article >
  )
}

