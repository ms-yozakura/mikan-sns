"use client"

import { navigationItems } from "../navigationItems"
import { SideBarItem } from "./SideBarItem"
import styles from "./SideBar.module.css"
import Link from "next/link"
import defaultAvatar from "@/img/default-avatar.jpg"
import { Icon } from "@iconify/react"
import { logout } from "@/features/auth/actions/logout"
import { useRouter } from "next/navigation"
import type { NavigationProfile } from "../types"

export function Sidebar({
  profile,
  unreadCount = 0,
}: {
  profile: NavigationProfile
  unreadCount?: number
}) {
  const router = useRouter()
  const avatarSrc = profile?.avatar_url ?? defaultAvatar.src
  const displayName = profile?.display_name || "名無しの柑橘"
  const username = profile?.username || "user"

  return (
    <aside className={styles.container}>
      <div className={styles.logoSpace}>
        <span className={styles.logo}>🍊</span>
        <span className={styles.title}>MikanSNS</span>
      </div>

      <nav className={styles.nav}>
        {navigationItems.map((item) => (
          <SideBarItem
            key={item.href}
            item={item}
            badgeCount={item.href === "/notifications" ? unreadCount : 0}
          />
        ))}
      </nav>

      <Link href="/profile" className={styles.nameChipWrapper}>
        <div className={styles.avatarWrapper}>
          <img src={avatarSrc} alt="Profile" className={styles.avatarImage} />
        </div>
        <div className={styles.nameContainer}>
          <h3 className={styles.postAuthor}>{displayName}</h3>
          <span className={styles.postUsername}>@{username}</span>
        </div>
      </Link>

      <div className={styles.logoutButton} onClick={() => {
        logout()
        router.push("/login")
      }}>
        <span className={styles.logoutText}>ログアウト</span>
        <Icon icon="mdi:logout" className={styles.logoutIcon}/>
      </div>
    </aside>
  )
}
