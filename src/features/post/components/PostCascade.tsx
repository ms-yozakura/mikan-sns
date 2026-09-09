'use client'

import { useCallback, useEffect, useState } from "react"
import { getPost } from "../actions/getPost"
import Loading from "@/shared/ui/Loading"
import { PostCard } from "@/features/post/components/PostCard/PostCard"
import { CommentList } from "./CommentList"
import type { Comment } from "./CommentCard/CommentCard"
import styles from "./PostCascade.module.css"
import { Leading } from "@/shared/ui/Leading"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { getComments } from "../actions/getComments"
import { CommentForm } from "./CommentForm/CommentForm"

export function PostCascade({ postId }: { postId: string }) {
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoadError(null)
        const [postData, fetchedComments] = await Promise.all([
          getPost(postId),
          getComments(postId),
        ])
        setPost(postData)
        setComments(fetchedComments as Comment[])
      } catch (error) {
        console.error("POST DETAIL LOAD ERROR:", error)
        setLoadError("投稿を読み込めませんでした。時間をおいて再度お試しください。")
      } finally {
        setLoading(false)
      }
    }

    void fetchPost()
  }, [postId])

  const handleCommentCreated = useCallback((comment: Comment) => {
    setComments((previous) => [...previous, comment])
  }, [])

  if (loading) {
    return <Loading />
  }

  if (loadError || !post) {
    return (
      <section className={styles.cascade}>
        <div className={styles.backButton}>
          <Leading onClick={() => router.back()}>
            <Icon icon="material-symbols:arrow-back" />
          </Leading>
        </div>
        <p role="alert">{loadError ?? "投稿が見つかりませんでした。"}</p>
      </section>
    )
  }

  return (
    <section className={styles.cascade}>
      <div className={styles.backButton}>
        <Leading
          onClick={() => {
            if (window.history.length > 1) {
              router.back()
            } else {
              router.push("/")
            }
          }}
        >
          <Icon icon="material-symbols:arrow-back" />
        </Leading>
      </div>

      <div className={styles.cascadeContent}>
        <div className={styles.postArea}>
          <PostCard post={post} enableCommentForm={false} enablePostLink={false} />
        </div>

        <CommentForm post={post} onSuccess={handleCommentCreated} />

        <CommentList
          comments={comments}
          post={post}
          onCommentCreated={handleCommentCreated}
        />
      </div>
    </section>
  )
}
