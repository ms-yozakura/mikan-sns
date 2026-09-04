'use client'

import Link from "next/link"
import { Icon } from "@iconify/react"
import { FloatingPostButton } from "@/features/post/components/FloatingPostButton"
import { Feed } from "../components/Feed"
import { MikanTree } from "../components/MikanTree"
import { useInfiniteFeed } from "../hooks/useInfiniteFeed"
import styles from "./HomePage.module.css"
import type { GlobalStats } from "@/features/stats/types/types"

type InitialPosts = Awaited<ReturnType<typeof import("../actions/getFeed").getFeed>>

export function HomePageClient({
  initialPosts,
  stats,
  treeSeed,
}: {
  initialPosts: InitialPosts
  stats: GlobalStats
  treeSeed: string
}) {
  const {
    posts,
    prependPost,
    loading,
    hasMore,
    loadMoreRef,
  } = useInfiniteFeed(initialPosts)

  const favorite = stats.ranking[0]

  return (
    <main className={styles.home}>
      <section className={styles.treeHero} aria-label="今月のみかんの木">
        <div className={styles.treeScene}>
          <MikanTree seed={treeSeed} className={styles.treeCanvas} />

          <Link href="/stats" className={`${styles.treeCard} ${styles.statsCard}`}>
            <Icon icon="mdi:chart-box-outline" className={styles.cardIcon} aria-hidden="true" />
            <span>今月のみかん</span>
            <strong>{stats.monthlyCount.toLocaleString("ja-JP")}個</strong>
          </Link>

          <Link href="/stats" className={`${styles.treeCard} ${styles.favoriteCard}`}>
            <Icon icon="mdi:crown-outline" className={styles.cardIcon} aria-hidden="true" />
            <span>人気の品種</span>
            <strong>{favorite?.name ?? "集計中"}</strong>
          </Link>

          <Link href="/stats" className={`${styles.treeCard} ${styles.communityCard}`}>
            <Icon icon="mdi:account-group-outline" className={styles.cardIcon} aria-hidden="true" />
            <span>みんなの記録</span>
            <strong>{stats.monthlyPosts.toLocaleString("ja-JP")}投稿</strong>
          </Link>

          <div className={`${styles.treeCard} ${styles.calendarCard} ${styles.comingSoon}`}>
            <Icon icon="mdi:calendar-month-outline" className={styles.cardIcon} aria-hidden="true" />
            <span>みかんカレンダー</span>
            <small>準備中</small>
          </div>

          <div className={styles.postAction}>
            <FloatingPostButton onSuccess={prependPost} />
          </div>
        </div>

        <a href="#timeline" className={styles.scrollGuide}>
          <span aria-hidden="true">⌄</span>
          スクロールしてタイムラインへ
        </a>
      </section>

      <section id="timeline" className={styles.timeline} aria-labelledby="timeline-heading">
        <div className={styles.timelineHeading}>
          <h2 id="timeline-heading">タイムライン</h2>
        </div>

        <Feed
          contents={posts}
          hasMore={hasMore}
          loading={loading}
          loadMoreRef={loadMoreRef}
        />
      </section>
    </main>
  )
}
