import { useActionState, useEffect, useRef } from "react"
import { createComment } from "../../actions/createComment"
import type { Comment } from "../CommentCard/CommentCard"

import styles from "./CommentForm.module.css"
import Button from "@/shared/ui/Button"

export function CommentForm({
  post,
  onSuccess,
  replyTo,
  onCancelReply,
}: {
  post: any
  onSuccess?: (comment: Comment) => void
  replyTo?: Comment | null
  onCancelReply?: () => void
}) {
  const [state, action, pending] = useActionState(createComment, null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const replyToName = replyTo?.users?.display_name || "このコメント"

  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus()
    }
  }, [replyTo])

  useEffect(() => {
    if (state?.success) {
      onSuccess?.(state.comment)
      formRef.current?.reset()
      onCancelReply?.()
    }
  }, [state, onSuccess, onCancelReply])

  return (
    <div className={styles.commentFormSection}>
      {replyTo && (
        <div className={styles.replyContext}>
          <span>{replyToName}さんに返信</span>
          <button type="button" onClick={onCancelReply} aria-label="返信をやめる">
            ×
          </button>
        </div>
      )}

      <form ref={formRef} action={action} className={styles.commentForm}>
        <input type="hidden" name="postId" value={post.id} />
        {replyTo && (
          <input type="hidden" name="parentCommentId" value={replyTo.id} />
        )}
        <textarea
          ref={textareaRef}
          name="body"
          placeholder={replyTo ? `${replyToName}さんに返信` : "コメントを入力"}
          aria-label={replyTo ? `${replyToName}さんに返信` : "コメントを入力"}
          rows={1}
        />
        <Button size="s" type="submit" disabled={pending}>
          送信
        </Button>
      </form>

      {state?.error && <p className={styles.error}>{state.error}</p>}
    </div>
  )
}
