"use client"

import styles from "./Navigation.module.css"
import { MobileHeader } from "./components/MobileHeader"
import { NavigationBar } from "./components/NavigationBar"
import { Sidebar } from "./components/SideBar"
import type { NavigationProfile } from "./types"

export function Navigation({
  profile,
  unreadCount = 0,
}: {
  profile: NavigationProfile
  unreadCount?: number
}) {
  return (
    <div className={styles.navigation}>
      <div className={styles.mobile}>
        <MobileHeader profile={profile} unreadCount={unreadCount} />
        <NavigationBar unreadCount={unreadCount} />
      </div>

      <div className={styles.desktop}>
        <Sidebar profile={profile} unreadCount={unreadCount} />
      </div>
    </div>
  )
}
