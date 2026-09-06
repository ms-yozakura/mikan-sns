'use client'

import Link from "next/link"
import { useCallback, useState } from "react"
import { Icon } from "@iconify/react"
import { FloatingPostButton } from "@/features/post/components/FloatingPostButton"
import { SegmentedTabs } from "@/shared/ui/SegmentedTabs"
import { Feed } from "../components/Feed"
import { MikanTree } from "../components/MikanTree"
import { getFeed, type FeedScope } from "../actions/getFeed"
import { useInfiniteFeed, type InfiniteFeedPost } from "../hooks/useInfiniteFeed"
import styles from "./HomePage.module.css"
import type { GlobalStats } from "@/features/stats/types/types"

type InitialPosts = Awaited<ReturnType<typeof getFeed>>

const FEED_TABS = [
  { value: "all", label: "すべて" },
  { value: "following", label: "フォロー中" },
] as const

export function HomePageClient({
  initialPosts,
  initialFollowingPosts,
  stats,
  treeSeed,
}: {
  initialPosts: InitialPosts
  initialFollowingPosts: InitialPosts
  stats: GlobalStats
  treeSeed: string
}) {
  const [feedScope, setFeedScope] = useState<FeedScope>("all")
  const fetchAllPosts = useCallback(
    (cursor: { id: number | string; created_at: string }) => getFeed(cursor, 10, "all") as Promise<InfiniteFeedPost[]>,
    []
  )
  const fetchFollowingPosts = useCallback(
    (cursor: { id: number | string; created_at: string }) => getFeed(cursor, 10, "following") as Promise<InfiniteFeedPost[]>,
    []
  )

  const allFeed = useInfiniteFeed(
    initialPosts as InfiniteFeedPost[],
    fetchAllPosts
  )
  const followingFeed = useInfiniteFeed(
    initialFollowingPosts as InfiniteFeedPost[],
    fetchFollowingPosts
  )

  const activeFeed = feedScope === "all" ? allFeed : followingFeed
  const favorite = stats.ranking[0]

  return (
    <main className={styles.home}>
      <section className={styles.treeHero} aria-label="今月のみかんの木">
        <div className={styles.treeScene}>
          <MikanTree seed={treeSeed} className={styles.treeCanvas} />

          <Link href="/stats" className={`${styles.treeCard} ${styles.statsCard}`}>
            <Icon
              icon="mdi:chart-box-outline"
              className={`${styles.cardIcon} ${styles.statsIcon}`}
              aria-hidden="true"
            />
            <span>今月のみかん</span>
            <strong>{stats.monthlyCount.toLocaleString("ja-JP")}個</strong>
          </Link>

          <Link href="/stats" className={`${styles.treeCard} ${styles.favoriteCard}`}>
            <Icon
              icon="mdi:crown-outline"
              className={`${styles.cardIcon} ${styles.favoriteIcon}`}
              aria-hidden="true"
            />
            <span>人気の品種</span>
            <strong>{favorite?.name ?? "集計中"}</strong>
          </Link>

          <Link href="/stats" className={`${styles.treeCard} ${styles.communityCard}`}>
            <Icon
              icon="mdi:account-group-outline"
              className={`${styles.cardIcon} ${styles.communityIcon}`}
              aria-hidden="true"
            />
            <span>みんなの記録</span>
            <strong>{stats.monthlyPosts.toLocaleString("ja-JP")}投稿</strong>
          </Link>

          <Link href="/calendar" className={`${styles.treeCard} ${styles.calendarCard}`}>
            <Icon
              icon="mdi:calendar-month-outline"
              className={`${styles.cardIcon} ${styles.calendarIcon}`}
              aria-hidden="true"
            />
            <span>みかんカレンダー</span>
            <strong>記録を見る</strong>
          </Link>

          <div className={styles.postAction}>
            <FloatingPostButton onSuccess={allFeed.prependPost} />
          </div>
        </div>

        <a href="#timeline" className={styles.scrollGuide}>
          <span aria-hidden="true">⌄</span>
          スクロールしてタイムラインへ
        </a>
      </section>

      <section id="timeline" className={styles.timeline} aria-labelledby="timeline-heading">
        <div className={styles.timelineHeading}>
          <Icon icon="mdi:leaf" className={`${styles.timelineLeaf} ${styles.timelineLeafLeft}`} aria-hidden="true" />
          <h2 id="timeline-heading">みんなの投稿</h2>
          <Icon icon="mdi:leaf" className={`${styles.timelineLeaf} ${styles.timelineLeafRight}`} aria-hidden="true" />
        </div>

        <SegmentedTabs
          value={feedScope}
          options={FEED_TABS}
          onChange={setFeedScope}
          ariaLabel="タイムラインの表示範囲"
          className={styles.feedTabs}
        />

        <Feed
          contents={activeFeed.posts}
          hasMore={activeFeed.hasMore}
          loading={activeFeed.loading}
          loadMoreRef={activeFeed.loadMoreRef}
        />
      </section>
    </main>
  )
}
