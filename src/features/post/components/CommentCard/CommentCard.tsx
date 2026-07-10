

import Link from "next/link"
import styles from "./CommentCard.module.css"

type Comment = {
  body: string,
  created_at: string
  users: any
}


export function CommentCard({ comment }: { comment: Comment }) {


  // ユーザーのプロフィール画像URL（なければデフォルト）
  const avatarUrl = comment.users?.avatar_url || null

  const formattedDate = new Date(comment.created_at).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })



  return (
    <article className={styles.commentCard}> 
      <Link
        href={`/user/${comment.users?.username}`}
        className={styles.postHeader}
        onClick={(e) => {
          e.stopPropagation() // カード全体のクリックイベントを抑止
        }}
      >
        <div className={styles.avatarWrapper}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${comment.users?.display_name}'s avatar`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>🍊</div>
          )}
        </div>
      </Link>
      <div className={styles.commentBody}>
        <div className={styles.commentUserInfo}>
            <h3 className={styles.postAuthor}>{comment.users?.display_name || '名無しの柑橘'}</h3>
          <span className={styles.postDate}>{formattedDate}</span>
        </div>
        <div>
        {comment.body}
        </div>
      </div>
    </article>
  )
}
