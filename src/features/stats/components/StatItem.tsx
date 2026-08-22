import styles from "./StatItem.module.css"

type Props = {
  label: string
  value: string | number
  suffix?: string
}

export function StatItem({ label, value, suffix }: Props) {
  return (
    <div className={styles.statItem}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        {value}
        {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
      </div>
    </div>
  )
}
