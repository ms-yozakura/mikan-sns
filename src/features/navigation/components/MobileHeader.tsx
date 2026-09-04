import Link from "next/link"
import { Icon } from "@iconify/react"
import defaultAvatar from "@/img/default-avatar.jpg"
import type { NavigationProfile } from "../types"
import styles from "./MobileHeader.module.css"

export function MobileHeader({ profile }: { profile: NavigationProfile }) {
  const avatarSrc = profile?.avatar_url ?? defaultAvatar.src

  return (
    <header className={styles.mobileHeader}>
      <Link href="/home" className={styles.brand} aria-label="MikanSNS ホーム">
        <span className={styles.logo} aria-hidden="true">🍊</span>
        <span className={styles.title}>MikanSNS</span>
      </Link>

      <div className={styles.actions}>
        <Link
          href="/notifications"
          className={styles.iconButton}
          aria-label="通知を見る"
        >
          <Icon icon="mdi:bell-outline" width={22} height={22} aria-hidden="true" />
        </Link>

        <Link href="/profile" className={styles.avatarLink} aria-label="プロフィールを見る">
          <img
            src={avatarSrc}
            alt=""
            width={34}
            height={34}
            className={styles.avatar}
          />
        </Link>
      </div>
    </header>
  )
}
