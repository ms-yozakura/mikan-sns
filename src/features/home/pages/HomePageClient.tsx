'use client'

import Link from "next/link"
import { FloatingPostButton } from "@/features/post/components/FloatingPostButton"
import { Feed } from "../components/Feed"
import { useInfiniteFeed } from "../hooks/useInfiniteFeed"
import styles from "./HomePage.module.css"
import type { GlobalStats } from "@/features/stats/types/types"

type InitialPosts = Awaited<ReturnType<typeof import("../actions/getFeed").getFeed>>

export function HomePageClient({
  initialPosts,
  stats,
}: {
  initialPosts: InitialPosts
  stats: GlobalStats
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
      <section className={styles.treeHero} aria-labelledby="tree-heading">
        <div className={styles.heroIntro}>
          <p>今月のみかんの木</p>
          <h1 id="tree-heading">みかんを楽しもう</h1>
        </div>

        <div className={styles.treeScene}>
          <div className={styles.canopy} aria-hidden="true">
            <span className={styles.orangeOne} />
            <span className={styles.orangeTwo} />
            <span className={styles.orangeThree} />
            <span className={styles.orangeFour} />
          </div>
          <div className={styles.trunk} aria-hidden="true" />

          <Link href="/stats" className={`${styles.treeCard} ${styles.statsCard}`}>
            <span className={styles.cardIcon} aria-hidden="true">📊</span>
            <span>今月のみかん</span>
            <strong>{stats.monthlyCount.toLocaleString("ja-JP")}個</strong>
          </Link>

          <Link href="/stats" className={`${styles.treeCard} ${styles.favoriteCard}`}>
            <span className={styles.cardIcon} aria-hidden="true">🏅</span>
            <span>人気の品種</span>
            <strong>{favorite?.name ?? "集計中"}</strong>
          </Link>

          <Link href="/stats" className={`${styles.treeCard} ${styles.communityCard}`}>
            <span className={styles.cardIcon} aria-hidden="true">🍊</span>
            <span>みんなの記録</span>
            <strong>{stats.monthlyPosts.toLocaleString("ja-JP")}投稿</strong>
          </Link>

          <Link href="/stats" className={`${styles.treeCard} ${styles.calendarCard}`}>
            <span className={styles.cardIcon} aria-hidden="true">📅</span>
            <span>みかんカレンダー</span>
          </Link>

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
          <span aria-hidden="true">🍃</span>
          <div>
            <p>みんなのみかん便り</p>
            <h2 id="timeline-heading">タイムライン</h2>
          </div>
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
