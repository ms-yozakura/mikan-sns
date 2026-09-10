import Link from "next/link";
import { MikanBrandLogo } from "@/shared/ui/MikanBrandLogo";
import styles from "./page.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="landing-title">
        <h1 id="landing-title" className={styles.srOnly}>MikanSNS</h1>
        <MikanBrandLogo size="large" className={styles.logo} />

        <div className={styles.actions}>
          <Link href="/signup" className={`${styles.button} ${styles.primary}`}>
            新規登録
          </Link>
          <Link href="/login" className={`${styles.button} ${styles.secondary}`}>
            ログイン
          </Link>
          <a
            href="https://mikanfan.club"
            className={`${styles.button} ${styles.club}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            東大みかん愛好会
          </a>
        </div>
      </section>
    </main>
  );
}
