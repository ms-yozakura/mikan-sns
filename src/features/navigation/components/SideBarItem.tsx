
"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"

import { usePathname } from "next/navigation"

import styles from "./SideBar.module.css"


type Props = {
  item: {
    label: string
    href: string
    icon: string
  }
}


export function SideBarItem({
  item,
}: Props) {

  const pathname = usePathname()

  const active = pathname === item.href

  return (
    <Link
      href={item.href}
      className={`${styles.item} ${active ? styles.active : ""
        }`}
    >
      <Icon
        icon={item.icon}
        className={styles.icon}
      />
      <span className={styles.label}>
        {item.label}
      </span>
    </Link>
  )
}
