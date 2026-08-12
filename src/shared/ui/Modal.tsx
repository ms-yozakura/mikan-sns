'use client'

import { ReactNode, useEffect, useState } from 'react'
import styles from './Modal.module.css'
import { Icon } from '@iconify/react'

type Props = {
  open: boolean
  onClose: () => void
  onExited: () => void
  children: ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  onExited,
  children,
  className,
}: Props) {

  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)


  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    } else {
      setClosing(true)
    }
  }, [open])


  const handleAnimationEnd = () => {
    if (closing) {
      setVisible(false)
      setClosing(false)
      onExited()
    }
  }


  if (!visible) return null


  return (
    <div
      className={`${styles.overlay} ${closing ? styles.fadeOut : ''
        }`}
      onAnimationEnd={handleAnimationEnd}
      onMouseDown={onClose}
    >
      <div
        className={`${styles.modal} ${className ?? ''} ${closing ? styles.slideOut : ''
          }`}
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        <button className={styles.closeButton} onClick={onClose}>
          <Icon icon="mdi:close"></Icon>
        </button>

        {children}
      </div>
    </div>
  )
}
