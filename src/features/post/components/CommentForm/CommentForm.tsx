import { useActionState, useEffect, useRef } from "react"
import { createComment } from "../../actions/createComment"

import styles from "./CommentForm.module.css"
import Button from "@/shared/ui/Button"

export function CommentForm({ post, onSuccess }: { post: any, onSuccess?: (comment: any) => void }) {
  const [state, action, pending] = useActionState(createComment, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      onSuccess?.(state.comment)
      formRef.current?.reset()
    }
  }, [state])

  return (
    <div className={styles.commentFormSection}>
      <form ref={formRef} action={action} className={styles.commentForm}>
        <input type="hidden" name="postId" value={post.id} />
        <textarea
          name="body"
          placeholder="コメントを入力"
          aria-label="コメントを入力"
          rows={1}
        />
        <Button size="s" type="submit" disabled={pending}>
          送信
        </Button>
      </form>
    </div>
  )
}
