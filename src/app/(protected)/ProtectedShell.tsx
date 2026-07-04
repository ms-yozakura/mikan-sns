"use client"

import { usePathname } from "next/navigation"
import styles from "./ProtectedShell.module.css"

type ProtectedShellProps = {
  children: React.ReactNode
  navigation: React.ReactNode
  stats: React.ReactNode
}

export function ProtectedShell({
  children,
  navigation,
  stats,
}: ProtectedShellProps) {
  const pathname = usePathname()
  const showStatsRail = pathname !== "/stats"

  return (
    <div className={styles.shell}>
      {navigation}

      <main className={styles.mainColumn}>
        {children}
      </main>

      {showStatsRail && (
        <aside className={styles.statsRail} aria-label="Global stats">
          {stats}
        </aside>
      )}
    </div>
  )
}
