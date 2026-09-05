"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"
import { usePathname } from "next/navigation"
import styles from "./NavigationBar.module.css"

type Props = {
  item: {
    label: string
    href: string
    icon: string
    activeIcon?: string
  }
  badgeCount?: number
}

export function NavigationItem({ item, badgeCount = 0 }: Props) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <Link
      href={item.href}
      className={`${styles.item} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className={styles.iconWrap}>
        <Icon
          icon={active ? (item.activeIcon ?? item.icon) : item.icon}
          width={24}
          height={24}
          aria-hidden="true"
        />
        {badgeCount > 0 && <span className={styles.badge}>{badgeCount > 99 ? "99+" : badgeCount}</span>}
      </span>
      <span>{item.label}</span>
    </Link>
  )
}
