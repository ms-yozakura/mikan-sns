'use client'

import { FloatingPostButton } from "@/features/post/components/FloatingPostButton"
import { HomeStatsSummary } from "@/features/stats/components/HomeStatsSummary"
import { Feed } from "../components/Feed"
import { useInfiniteFeed } from "../hooks/useInfiniteFeed"
import styles from "./HomePage.module.css"

type InitialPosts = Awaited<ReturnType<typeof import("../actions/getFeed").getFeed>>

export function HomePageClient({
  initialPosts,
}: {
  initialPosts: InitialPosts
}) {
  const {
    posts,
    prependPost,
    loading,
    hasMore,
    loadMoreRef,
  } = useInfiniteFeed(initialPosts)

  return (
    <main className={styles.home}>
      <div className={styles.feedArea}>
        <div className={styles.mobileStats}>
          <HomeStatsSummary variant="mobile" />
        </div>

        <Feed contents={posts}
          hasMore={hasMore}

          loading={loading}

          loadMoreRef={loadMoreRef}
        />
      </div>

      <FloatingPostButton
        onSuccess={prependPost}
      />
    </main>
  )
}
