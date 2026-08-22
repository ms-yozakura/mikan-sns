
import styles from "./RankingSection.module.css"

export function RankingSection({
  title,
  items,
  showCounts,
  emptyMessage = "まだ記録がありません",
}: {
  title: string
  items: { name: string; count: number }[]
  showCounts: boolean
  emptyMessage?: string
}) {
  return (
    <section className={styles.rankingSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {items.length > 0 ? (
        <ol className={styles.rankingList}>
          {items.map((item, index) => (
            <li key={item.name} className={styles.rankingItem}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.itemName}>{item.name}</span>
              {showCounts ? <span className={styles.count}>{item.count}個</span> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </section>
  )
}
