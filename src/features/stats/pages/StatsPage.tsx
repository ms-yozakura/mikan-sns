import Link from "next/link"
import BarChart, { type BarChartItem } from "@/shared/ui/BarChart"
import { MikanIcon } from "@/features/mikan/components/MikanIcon"
import { getGlobalStats } from "../actions/getGlobalStats"
import {
  UserRankingSection,
  VarietyRankingSection,
} from "../components/RankingSection"
import { StatItem } from "../components/StatItem"
import styles from "./StatsPage.module.css"

export async function StatsPage() {
  const stats = await getGlobalStats()
  const hasCurrentData = stats.monthlyPosts > 0
  const trendData: BarChartItem[] = stats.monthlyTrend.map((item) => ({
    key: item.key,
    label: item.label,
    value: item.count,
  }))

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>みんなの記録</p>
          <h1 className={styles.title}>今月のみかん、誰が何を食べた？</h1>
          <p className={styles.description}>人気の品種と、たくさんみかんを楽しんだ人を中心に眺められる統計ページです。</p>
        </div>
        <div className={styles.headerVisual} aria-hidden="true">
          <MikanIcon size={68} />
          <span className={styles.period}>{stats.periodLabel}</span>
        </div>
      </header>

      {!hasCurrentData ? (
        <section className={styles.emptyState} aria-labelledby="empty-title">
          <span className={styles.emptyIcon} aria-hidden="true">🍊</span>
          <div>
            <h2 id="empty-title">今月の記録はまだありません</h2>
            <p>最初のみかんを記録すると、ここに統計が表示されます。</p>
          </div>
          <Link href="/home" className={styles.emptyLink}>投稿を見にいく</Link>
        </section>
      ) : null}

      <section className={styles.rankingGrid} aria-label={`${stats.periodLabel}のランキング`}>
        <article className={`${styles.rankingCard} ${styles.varietyCard}`}>
          <VarietyRankingSection
            eyebrow="MIKAN RANKING"
            title="よく食べられた品種"
            items={stats.ranking}
          />
          <p className={styles.note}>公開投稿に記録された個数を集計しています。</p>
        </article>

        <article className={`${styles.rankingCard} ${styles.userCard}`}>
          <UserRankingSection
            eyebrow="MIKAN EATER RANKING"
            title="いっぱい食べたユーザー"
            items={stats.userRanking}
          />
          <p className={styles.note}>公開投稿で記録したみかんの合計個数です。</p>
        </article>
      </section>

      <section className={styles.summary} aria-label={`${stats.periodLabel}のサマリー`}>
        <StatItem label="食べたみかん" value={stats.monthlyCount.toLocaleString("ja-JP")} suffix="個" />
        <StatItem label="みかん投稿" value={stats.monthlyPosts.toLocaleString("ja-JP")} suffix="件" />
        <StatItem label="活動ユーザー" value={stats.activeUsers.toLocaleString("ja-JP")} suffix="人" />
        <StatItem
          label="平均満足度"
          value={stats.averageSatisfaction > 0 ? stats.averageSatisfaction.toFixed(2) : "—"}
          suffix={stats.averageSatisfaction > 0 ? "/ 5" : undefined}
        />
      </section>

      <section className={styles.chartSection} aria-label="直近6か月のみかん消費量">
        <BarChart
          data={trendData}
          title="直近6か月のみかん消費量（個）"
          maxValue={undefined}
          defaultOrientation="vertical"
          defaultSortOrder="default"
          defaultVisibleCount={6}
          showIcons={false}
          verticalLabelDirection="horizontal"
        />
      </section>
    </main>
  )
}
