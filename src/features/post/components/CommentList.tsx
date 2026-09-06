import { CommentCard } from "./CommentCard/CommentCard"
import styles from "./CommentList.module.css"

export function CommentList({ comments }: { comments: any[] }) {
  return (
    <section className={styles.commentSection} aria-label="コメント">
      <div className={styles.commentNum}>コメント {comments.length}件</div>
      <div className={styles.commentList}>
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </section>
  )
}
