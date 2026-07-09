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
      <Link
        href={`/user/${post.users?.username}`}
        className={styles.postHeader}
        onClick={(e) => {
          e.stopPropagation() // カード全体のクリックイベントを抑止
        }}
      >
        <div className={styles.avatarWrapper}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${post.users?.display_name}'s avatar`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>🍊</div>
          )}
        </div>
        <div className={styles.postUserInfo}>
          <div className={styles.nameContainer}>
            <h3 className={styles.postAuthor}>{post.users?.display_name || '名無しの柑橘'}</h3>
            <span className={styles.postUsername}>@{post.users?.username || 'user'}</span>
          </div>
          <span className={styles.postDate}>{formattedDate}</span>
        </div>
        {post.visibility != "public" &&
          <div className={styles.visibilityTag}>
            {post.visibility}
          </div>
        }
      </Link>

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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641l-.318 1.235c-.083.323.218.614.53.5l1.234-.452a2.156 2.156 0 0 1 1.61.048c1.373.57 2.894.848 4.453.848Z" />
          </svg>
          <span className={styles.actionCount}>0</span>
        </button>

        <button
          className={`${styles.actionButton} ${styles.likeBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            // いいね処理のモック
          }}
          aria-label="いいね"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
        </button>

        <button
          className={`${styles.actionButton} ${styles.shareBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            // シェア処理のモック
          }}
          aria-label="シェア"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
        </button>
      </div>
      {commentFormDisp && (
        <form
          action={action}
          className={styles.commentForm}
        >
          <input
            type="hidden"
            name="postId"
            value={post.id}
          />
          <input
            name="body"
            type="text"
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
      )}
    </article>
  )
}

