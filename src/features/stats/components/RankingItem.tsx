import styles from "./GlobalStats.module.css"

type Props = {
  rank: number
  name: string
  count: number
}

export function RankingItem({
  rank,
  name,
  count,
}: Props) {
  return (
    <div className={styles.rankingItem}>
      <span>{rank}.</span>

      <span>{name}</span>

      <span>{count}個</span>
    </div>
  )
}
