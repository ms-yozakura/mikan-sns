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
  }
}

export function NavigationItem({ item }: Props) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <Link
      href={item.href}
      className={`${styles.item} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon icon={item.icon} width={24} height={24} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}
