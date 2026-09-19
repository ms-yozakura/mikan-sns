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



import { useRouter } from 'next/navigation'

export function BackButton({children}:{children:ReactNode}) {
  const router = useRouter()

  return (
    <Leading onClick={() => router.back()}>
      {children}
    </Leading>
  )
}
