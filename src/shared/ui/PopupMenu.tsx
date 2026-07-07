'use client'

import { useEffect, useState, ReactNode } from "react"
import { usePopupMenu } from "@/providers/PopupMenuProvider"
import styles from "./PopupMenu.module.css"

type PopupMenuComponent = (props: PopupMenuProps) => React.JSX.Element

export type Placement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"

type PopupMenuProps = {
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
  placement: Placement
  children: React.ReactNode
}

const PopupMenu = (({
  anchor,
  open,
  onClose,
  placement,
  children,
}: PopupMenuProps) => {

  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!open || !anchor) return

    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect()

      switch (placement) {
        case "bottom-start":
          setStyle({
            top: rect.bottom,
            left: rect.left,
          })
          break

        case "bottom-end":
          setStyle({
            top: rect.bottom,
            left: rect.right,
            transform: "translateX(-100%)",
          })
          break

        case "top-start":
          setStyle({
            top: rect.top,
            left: rect.left,
            transform: "translateY(-100%)",
          })
          break

        case "top-end":
          setStyle({
            top: rect.top,
            left: rect.right,
            transform: "translate(-100%, -100%)",
          })
          break
      }
    }

    updatePosition()

    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }

  }, [anchor, open, placement])

  if (!open || !anchor) return null

  return (
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
      />

      <div
        className={styles.popup}
        style={style}
      >
        {children}
      </div>
    </>
  )

}) as PopupMenuComponent & {
  Item: typeof PopupMenuItem
}


function PopupMenuItem({
  children,
  onClick
}: {
  children: ReactNode,
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}) {
  const { closePopupMenu } = usePopupMenu()
  return (
    <div className={styles.ItemWrapper}>
      <button
        className={styles.ItemButton}
        onClick={(e) => {
          onClick?.(e)
          closePopupMenu()
        }}

      >{children}</button>
    </div>)
}

PopupMenu.Item = PopupMenuItem

export { PopupMenu }
