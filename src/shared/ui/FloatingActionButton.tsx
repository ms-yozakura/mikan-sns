
'use client'

import { ReactNode } from 'react'
import styles from './FloatingActionButton.module.css'

type Props = {
  children: ReactNode
  onClick?: () => void
}

export function FloatingActionButton({
  children,
  onClick,
}: Props) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
