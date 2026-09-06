'use client'

import { useEffect, useState } from 'react'
import { MikanIcon } from '@/features/mikan/components/MikanIcon'
import { MikanBrandLogo } from '@/shared/ui/MikanBrandLogo'
import styles from './AppSplashScreen.module.css'

const MIN_VISIBLE_MS = 850
const EXIT_MS = 240

export function AppSplashScreen() {
  const [isExiting, setIsExiting] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const startedAt = performance.now()
    let exitTimer: ReturnType<typeof setTimeout> | undefined
    let removeTimer: ReturnType<typeof setTimeout> | undefined

    const beginExit = () => {
      const elapsed = performance.now() - startedAt
      const delay = Math.max(0, MIN_VISIBLE_MS - elapsed)

      exitTimer = setTimeout(() => {
        setIsExiting(true)
        removeTimer = setTimeout(() => setIsVisible(false), EXIT_MS)
      }, delay)
    }

    if (document.readyState === 'complete') {
      requestAnimationFrame(beginExit)
    } else {
      window.addEventListener('load', beginExit, { once: true })
    }

    return () => {
      window.removeEventListener('load', beginExit)
      if (exitTimer) clearTimeout(exitTimer)
      if (removeTimer) clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`${styles.splash} ${isExiting ? styles.exiting : ''}`}
      aria-label="MikanSNSを読み込み中"
      aria-live="polite"
      role="status"
    >
      <div className={styles.content}>
        <MikanBrandLogo size="large" className={styles.logo} />
        <div className={styles.loader} aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={styles.mikan}
              style={{ '--delay': `${index * 0.14}s` } as React.CSSProperties}
            >
              <MikanIcon size={24} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
