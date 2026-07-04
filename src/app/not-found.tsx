
import Link from "next/link"
import styles from "./not-found.module.css"

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <div className={styles.divider}></div>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.description}>
          お探しのページは見つかりません。
        </p>
        <div className={styles.buttonContainer}>
          <Link href="/" className={styles.primaryButton}>
            ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
