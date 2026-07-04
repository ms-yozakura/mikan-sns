import Link from "next/link"
import styles from "./HomeStatsSummary.module.css"
import { RankingSection } from "./RankingSection"


import { popularVarieties, topEaters, monthlyStatsData } from "../test/statsDataSamples"

type HomeStatsSummaryProps = {
  variant: "desktop" | "mobile"
}

export function HomeStatsSummary({ variant }: HomeStatsSummaryProps) {
  const rankingLimit = variant === "mobile" ? 2 : 3
  const showCounts = variant === "desktop"

  return (
    <section className={`${styles.panel} ${styles[variant]}`} aria-label="今月のみかん統計">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>今月のまとめ</p>
          <h2 className={styles.title}>みかん統計</h2>
        </div>
        <span className={styles.badge}>7月</span>
      </div>
      (データは適当です)


      <div className={styles.heroStat}>
        <span className={styles.heroLabel}>一ヶ月のみかん消費量</span>
        <strong className={styles.heroValue}>{monthlyStatsData[0].totalMikan}</strong>
      </div>

      <div className={styles.sections}>
        <RankingSection
          title="人気品種ランキング"
          items={popularVarieties.slice(0, rankingLimit)}
          showCounts={showCounts}
        />
        <RankingSection
          title="食べた個数ランキング"
          items={topEaters.slice(0, rankingLimit)}
          showCounts={showCounts}
        />
      </div>

      <Link href="/stats" className={styles.moreLink}>
        もっと見る
      </Link>
    </section>
  )
}

