import { CommentCard } from "./CommentCard/CommentCard"

import styles from "./CommentList.module.css"


export function CommentList({ comments }: { comments: any[] }) {


  return (
    <div className={styles.commentList}>
      <div className={styles.commentNum}>コメント:{comments.length}件</div>
      {comments.map((comment) => {
        return (
          <CommentCard key={comment.id} comment={comment} />
        )
      })}
    </div>
  )
}
