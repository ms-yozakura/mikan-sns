import { useActionState } from "react"
import { createComment } from "../../actions/createComment"

import styles from "./CommentForm.module.css"
import Button from "@/shared/ui/Button"

export function CommentForm({ post }: { post: any }) {
  const [state, action, pending] = useActionState(createComment, null)


  return (
    <div className={styles.commentFormSection}>
      <div className={styles.commentFormMessage}>コメントを残す</div>
      <div className={styles.commentFormBox}>
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
          />
          <Button
            size="s"
            type="submit"
            disabled={pending}
          >
            送信
          </Button>
        </form>
      </div>
    </div>
  )
}
