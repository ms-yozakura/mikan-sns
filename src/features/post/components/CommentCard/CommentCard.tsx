import Link from "next/link"
import styles from "./CommentCard.module.css"

export type Comment = {
  id: string
  body: string
  created_at: string
  parent_comment_id: string | null
  users: {
    username?: string | null
    display_name?: string | null
    avatar_url?: string | null
  } | null
}

export function CommentCard({
  comment,
  replyToName,
  onReply,
}: {
  comment: Comment
  replyToName?: string | null
  onReply?: (comment: Comment) => void
}) {
  const avatarUrl = comment.users?.avatar_url || null
  const displayName = comment.users?.display_name || "名無しの柑橘"
  const username = comment.users?.username

  const formattedDate = new Date(comment.created_at).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <article id={`comment-${comment.id}`} className={styles.commentCard}>
      {username ? (
        <Link
          href={`/user/${username}`}
          className={styles.postHeader}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}のアバター`}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>🍊</div>
            )}
          </div>
        </Link>
      ) : (
        <div className={styles.postHeader}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarPlaceholder}>🍊</div>
          </div>
        </div>
      )}

      <div className={styles.commentBody}>
        <div className={styles.commentUserInfo}>
          {username ? (
            <Link href={`/user/${username}`} className={styles.authorLink}>
              {displayName}
            </Link>
          ) : (
            <span className={styles.authorLink}>{displayName}</span>
          )}
          <span className={styles.postDate}>{formattedDate}</span>
        </div>

        <div className={styles.commentText}>
          {replyToName && <span className={styles.mention}>@{replyToName} </span>}
          {comment.body}
        </div>

        {onReply && (
          <button
            type="button"
            className={styles.replyButton}
            onClick={() => onReply(comment)}
          >
            返信
          </button>
        )}
      </div>
    </article>
  )
}
