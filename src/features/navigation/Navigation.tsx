"use client"
import styles from "./Navigation.module.css"
import { NavigationBar } from "./components/NavigationBar"
import { Sidebar } from "./components/SideBar"
import type { NavigationProfile } from "./types"

export function Navigation({ profile }: { profile: NavigationProfile }) {
  return (
    <div className={styles.navigation}>

      <div className={styles.mobile}>
        <NavigationBar profile={profile} />
      </div>

      <div className={styles.desktop}>
        <Sidebar profile={profile}/>
      </div>
    </div>
  )
}
