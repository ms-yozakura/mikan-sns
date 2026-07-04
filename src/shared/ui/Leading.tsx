'use client'

import { ReactNode } from 'react'
import styles from './Leading.module.css'

type Props = {
  children: ReactNode
  onClick?: () => void
}

export function Leading({
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
