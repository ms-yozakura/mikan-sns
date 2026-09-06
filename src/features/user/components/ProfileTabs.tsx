"use client"

import { useCallback, useState } from "react"
import { Feed } from "@/features/home/components/Feed"
import { useInfiniteFeed, type InfiniteFeedPost } from "@/features/home/hooks/useInfiniteFeed"
import { getUserFeed } from "../actions/getUserFeed"
import { getReactedPosts } from "../actions/getReactedPosts"
import styles from "../pages/UserPage.module.css"

type ProfileTabsProps = {
  username: string
  posts: InfiniteFeedPost[]
}

type TabType = "feed" | "reactions"

export function ProfileTabs({ username, posts: initialPosts }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("feed")
  const [reactedPosts, setReactedPosts] = useState<InfiniteFeedPost[] | null>(null)
  const [reactionsLoading, setReactionsLoading] = useState(false)

  const getNextUserPosts = useCallback(async (
    cursor: { id: string | number; created_at: string }
  ) => {
    const data = await getUserFeed({ username, cursor })
    return data?.posts ?? []
  }, [username])

  const {
    posts,
    loading,
    hasMore,
    loadMoreRef,
  } = useInfiniteFeed(initialPosts, getNextUserPosts)

  async function selectReactionsTab() {
    setActiveTab("reactions")
    if (reactedPosts !== null || reactionsLoading) return

    setReactionsLoading(true)
    try {
      const nextPosts = await getReactedPosts({ username })
      setReactedPosts(nextPosts)
    } finally {
      setReactionsLoading(false)
    }
  }

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabList}>
        <button
          className={`${styles.tabButton} ${activeTab === "feed" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("feed")}
        >
          投稿
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "reactions" ? styles.tabActive : ""}`}
          onClick={() => void selectReactionsTab()}
        >
          リアクション
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "feed" && (
          <Feed
            contents={posts}
            hasMore={hasMore}
            loading={loading}
            loadMoreRef={loadMoreRef}
          />
        )}

        {activeTab === "reactions" && reactionsLoading && (
          <div className={styles.emptyState}>
            <p>リアクションした投稿を読み込んでいます…</p>
          </div>
        )}

        {activeTab === "reactions" && !reactionsLoading && reactedPosts !== null && reactedPosts.length > 0 && (
          <Feed contents={reactedPosts} />
        )}

        {activeTab === "reactions" && !reactionsLoading && reactedPosts !== null && reactedPosts.length === 0 && (
          <div className={styles.emptyState}>
            <p>リアクションした投稿はまだありません。</p>
          </div>
        )}
      </div>
    </div>
  )
}
