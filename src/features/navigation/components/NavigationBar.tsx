"use client"

import { navigationItems } from "../navigationItems"
import { NavigationItem } from "./NavigationItem"

import styles from "./NavigationBar.module.css"
import defaultAvatar from "@/img/default-avatar.jpg"

import Link from "next/link"
import { logout } from "@/features/auth/actions/logout"
import { Icon } from "@iconify/react"
import type { NavigationProfile } from "../types"
import { usePopupMenu } from "@/providers/PopupMenuProvider"
import { PopupMenu } from "@/shared/ui/PopupMenu"
import { useRouter } from "next/navigation"


export function NavigationBar({ profile }: { profile: NavigationProfile }) {
  const avatarSrc = profile?.avatar_url ?? defaultAvatar.src
  const { openPopupMenu } = usePopupMenu()

  const router = useRouter()

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
        <div className={styles.profileTip} onClick={(e) => openPopupMenu(
          e,
          "bottom-end"
          , <>
            <PopupMenu.Item>
              <Link href="/profile" className={styles.popupMenuItem}>
                <Icon icon="mdi:person" className={styles.icon} />
                <span>プロフィール</span>
              </Link>
            </PopupMenu.Item>
            <PopupMenu.Item>
              <div onClick={async () => {
                await logout();
                router.push("/login")
              }} className={`${styles.popupMenuItem} ${styles.logout}`}>
                <Icon icon="mdi:logout" className={styles.icon} />
                <span>ログアウト</span>
              </div>
            </PopupMenu.Item>
          </>
        )}>
          <div className={styles.avatarWrapper}>
            <img
              src={avatarSrc}
              alt="Profile"
              width={36}
              height={36}
              className={styles.avatarImage}>
            </img>
          </div>

          {/*
        <div className={styles.logoutButton} onClick={() => {
          logout();
        }}><Link href="/login" className={styles.logoutLink}>
            <Icon icon="mdi:logout" className={styles.logoutIcon} />
          </Link>
        </div>*/}


        </div>



      </nav>
  )
}
