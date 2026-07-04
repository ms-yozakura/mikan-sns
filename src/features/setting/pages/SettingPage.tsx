// SettingPage.tsx
import { ProfileEditForm } from "../components/ProfileEditForm"
import styles from "./SettingPage.module.css"

export function SettingPage() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>アカウント情報の変更とプロフィールの管理</p>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <ProfileEditForm />
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <p className={styles.placeholderText}>Coming soon...</p>
        </section>

        <section className={`${styles.card} ${styles.dangerZone}`}>
          <h2 className={styles.dangerTitle}>Danger Zone</h2>
          <p className={styles.dangerText}>アカウントを削除すると、すべてのデータが完全に消失します。</p>
          <button className={styles.dangerButton} onClick={()=>alert("未実装")}>
            Delete Account
          </button>
        </section>
      </div>
    </main>
  )
}
