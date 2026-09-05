"use client"

import { navigationItems } from "../navigationItems"
import { NavigationItem } from "./NavigationItem"
import styles from "./NavigationBar.module.css"

export function NavigationBar({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <nav className={styles.container} aria-label="メインナビゲーション">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.href}
          item={item}
          badgeCount={item.href === "/notifications" ? unreadCount : 0}
        />
      ))}
    </nav>
  )
}
