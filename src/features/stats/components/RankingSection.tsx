
import styles from "./RankingSection.module.css"

export function RankingSection({
  title,
  items,
  showCounts,
}: {
  title: string
  items: { name: string; count: number }[]
  showCounts: boolean
}) {
  return (
    <section className={styles.rankingSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <ol className={styles.rankingList}>
        {items.map((item, index) => (
          <li key={item.name} className={styles.rankingItem}>
            <span className={styles.rank} >{index + 1}</span>
            <span className={styles.itemName}>{item.name}</span>
            {showCounts && <span className={styles.count}>{item.count}個</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}
