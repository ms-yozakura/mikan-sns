'use client'

import { useMemo, useState } from "react"
import { CommentCard, type Comment } from "./CommentCard/CommentCard"
import { CommentForm } from "./CommentForm/CommentForm"
import styles from "./CommentList.module.css"

export function CommentList({
  comments,
  post,
  onCommentCreated,
}: {
  comments: Comment[]
  post: any
  onCommentCreated: (comment: Comment) => void
}) {
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)

  const threads = useMemo(() => {
    const byId = new Map(comments.map((comment) => [comment.id, comment]))
    const topLevel: Comment[] = []
    const repliesByRoot = new Map<string, Comment[]>()

    const findRootId = (comment: Comment) => {
      let current = comment
      const visited = new Set<string>([comment.id])

      while (current.parent_comment_id) {
        const parent = byId.get(current.parent_comment_id)
        if (!parent || visited.has(parent.id)) break
        visited.add(parent.id)
        current = parent
      }

      return current.id
    }

    for (const comment of comments) {
      if (!comment.parent_comment_id || !byId.has(comment.parent_comment_id)) {
        topLevel.push(comment)
        continue
      }

      const rootId = findRootId(comment)
      const replies = repliesByRoot.get(rootId) ?? []
      replies.push(comment)
      repliesByRoot.set(rootId, replies)
    }

    return { byId, topLevel, repliesByRoot }
  }, [comments])

  const renderReplyForm = (comment: Comment) =>
    replyingTo?.id === comment.id ? (
      <div className={styles.replyForm}>
        <CommentForm
          key={comment.id}
          post={post}
          replyTo={comment}
          onCancelReply={() => setReplyingTo(null)}
          onSuccess={onCommentCreated}
        />
      </div>
    ) : null

  return (
    <section className={styles.commentSection} aria-label="コメント">
      <div className={styles.commentNum}>コメント {comments.length}件</div>
      <div className={styles.commentList}>
        {threads.topLevel.map((comment) => (
          <div key={comment.id} className={styles.thread}>
            <CommentCard comment={comment} onReply={setReplyingTo} />
            {renderReplyForm(comment)}

            {(threads.repliesByRoot.get(comment.id) ?? []).length > 0 && (
              <div className={styles.replies}>
                {(threads.repliesByRoot.get(comment.id) ?? []).map((reply) => {
                  const replyTarget = reply.parent_comment_id
                    ? threads.byId.get(reply.parent_comment_id)
                    : null

                  return (
                    <div key={reply.id} className={styles.reply}>
                      <CommentCard
                        comment={reply}
                        replyToName={replyTarget?.users?.display_name}
                        onReply={setReplyingTo}
                      />
                      {renderReplyForm(reply)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
