"use client"

import { navigationItems } from "../navigationItems"
import { NavigationItem } from "./NavigationItem"

import styles from "./NavigationBar.module.css"
import defaultAvatar from "@/img/default-avatar.jpg"

import Link from "next/link"
import { logout } from "@/features/auth/actions/logout"
import { Icon } from "@iconify/react"
import type { NavigationProfile } from "../types"


export function NavigationBar({ profile }: { profile: NavigationProfile }) {
  const avatarSrc = profile?.avatar_url ?? defaultAvatar.src

  return (
    <nav className={styles.container}>

      <div className={styles.logoSpace}>
        <span className={styles.logo}>🍊</span>
      </div>


      {
        navigationItems.map((item) => (
          <NavigationItem
            key={item.href}
            item={item}
          />
        ))
      }
      <div className={styles.profileTip}>
        <Link
          href="/profile"
        >
          <div className={styles.avatarWrapper}>
            <img
              src={avatarSrc}
              alt="Profile"
              width={36}
              height={36}
              className={styles.avatarImage}>
            </img>
          </div>
        </Link>

        <div className={styles.logoutButton} onClick={() => {
          logout();
        }}><Link href="/login" className={styles.logoutLink}>
            <Icon icon="mdi:logout" className={styles.logoutIcon} />
          </Link>
        </div>
      </div>



    </nav>
  )
}
