'use client'

import { useEffect, useState } from "react"
import { getPost } from "../actions/getPost"
import Loading from "@/shared/ui/Loading"
import { PostCard } from "@/features/post/components/PostCard/PostCard"
import { CommentList } from "./CommentList"
import styles from "./PostCascade.module.css"
import { Leading } from "@/shared/ui/Leading"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { getComments } from "../actions/getComments"


export function PostCascade({ postId }: { postId: string }) {

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState<any[]>()
  const [loading, setLoading] = useState(true)
  const router = useRouter()


  useEffect(() => {

    async function fetchPost() {
      const data = await getPost(postId)
      const comments = await getComments(postId)
      setPost(data)
      setComments(comments)
      setLoading(false)
    }

    fetchPost()

  }, [postId])


  if (loading) {
    return <Loading />
  }


  return (
    <section className={styles.cascade}>
      <Leading onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }}>
        <Icon icon="material-symbols:arrow-back" />
      </Leading>


      <PostCard post={post} />
      {comments &&
        <CommentList comments={comments}
        />
      }

    </section>
  )
}
