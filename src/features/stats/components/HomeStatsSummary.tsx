import Link from "next/link"
import type { GlobalStats } from "../types/types"
import styles from "./HomeStatsSummary.module.css"
import { RankingSection } from "./RankingSection"

type HomeStatsSummaryProps = {
  variant: "desktop" | "mobile"
  stats: GlobalStats
}

export function HomeStatsSummary({ variant, stats }: HomeStatsSummaryProps) {
  const rankingLimit = variant === "mobile" ? 2 : 3
  const showCounts = variant === "desktop"

  return (
    <section className={`${styles.panel} ${styles[variant]}`} aria-label="今月のみかん統計">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>今月のまとめ</p>
          <h2 className={styles.title}>みかん統計</h2>
        </div>
        <span className={styles.badge}>{stats.periodLabel}</span>
      </div>

      <div className={styles.heroStat}>
        <span className={styles.heroLabel}>今月食べたみかん</span>
        <strong className={styles.heroValue}>
          {stats.monthlyCount.toLocaleString("ja-JP")}
          <span className={styles.heroUnit}>個</span>
        </strong>
      </div>

      <div className={styles.sections}>
        <RankingSection
          title="よく食べられた品種"
          items={stats.ranking.slice(0, rankingLimit)}
          showCounts={showCounts}
        />
        <dl className={styles.quickStats}>
          <div><dt>投稿</dt><dd>{stats.monthlyPosts.toLocaleString("ja-JP")}件</dd></div>
          <div><dt>活動ユーザー</dt><dd>{stats.activeUsers.toLocaleString("ja-JP")}人</dd></div>
        </dl>
      </div>

      <Link href="/stats" className={styles.moreLink}>
        もっと見る
      </Link>
    </section>
  )
}
