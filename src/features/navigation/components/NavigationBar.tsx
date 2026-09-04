"use client"

import { navigationItems } from "../navigationItems"
import { NavigationItem } from "./NavigationItem"
import styles from "./NavigationBar.module.css"

export function NavigationBar() {
  return (
    <nav className={styles.container} aria-label="メインナビゲーション">
      {navigationItems.map((item) => (
        <NavigationItem key={item.href} item={item} />
      ))}
    </nav>
  )
}
