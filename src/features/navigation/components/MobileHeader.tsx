
import styles from "./MobileHeader.module.css"

export function MobileHeader() {
  return (
    <div className={styles.mobileHeader}>
      <div className={styles.logoSpace}>
        <span className={styles.logo}>🍊</span>
        <span className={styles.title}>
          MikanSNS
        </span>
      </div>
    </div>
  )
}
