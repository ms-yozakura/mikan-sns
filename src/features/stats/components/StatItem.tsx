import styles from "./GlobalStats.module.css"

type Props = {
  label: string
  value: string | number
}

export function StatItem({ label, value }: Props) {
  return (
    <div className={styles.statItem}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  )
}
