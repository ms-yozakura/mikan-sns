'use client'

import Loading from "@/shared/ui/Loading"
import styles from "./Feed.module.css"

import { PostCard } from "@/features/post/components/PostCard/PostCard"

export type FeedPost = {
  id: string | number
} & Record<string, unknown>

type FeedProps = {
  contents: FeedPost[]
  hasMore?: boolean
  loading?: boolean
  loadMoreRef?: React.RefObject<HTMLDivElement | null>
}

export function Feed({
  contents,
  hasMore = false,
  loading = false,
  loadMoreRef,
}: FeedProps) {
  return (
    <div className={styles.feedWrapper}>
      {contents.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore && loadMoreRef && (
        <div ref={loadMoreRef}>
          <Loading></Loading>
        </div>
      )}
    </div>
  )
}
