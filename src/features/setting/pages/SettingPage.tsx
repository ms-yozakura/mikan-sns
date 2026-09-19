import Link from "next/link"
import { ProfileEditForm } from "../components/ProfileEditForm"
import { LogoutButton } from "../components/LogoutButton"
import { DeleteAccountButton } from "../components/DeleteAccountButton"
import styles from "./SettingPage.module.css"
import Button from "@/shared/ui/Button"

export function SettingPage({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>設定</h1>
        <p className={styles.subtitle}>アカウント情報の変更とプロフィールの管理</p>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <ProfileEditForm />
        </section>

        {isAdmin && (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>管理者用</h2>
            <Button>
              <Link href="/admin/mikan-varieties">みかん品種管理を開く →</Link>
            </Button>
          </section>
        )}

        <section className={styles.logoutSection} aria-label="アカウント">
          <LogoutButton />
        </section>

        <section className={`${styles.card} ${styles.dangerZone}`}>
          <h2 className={styles.dangerTitle}>アカウント削除</h2>
          <p className={styles.dangerText}>アカウントを削除すると、投稿や画像を含むすべてのデータが完全に削除されます。</p>
          <DeleteAccountButton />
        </section>
      </div>
    </main>
  )
}
