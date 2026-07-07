import { usePopupMenu } from "@/providers/PopupMenuProvider"
import { ReactNode } from "react"
import styles from "./PopupMenu.module.css"

type PopupMenuComponent = (props: PopupMenuProps) => React.JSX.Element

type PopupMenuProps = {
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
  children: React.ReactNode
}



const PopupMenu = (({
  anchor,
  open,
  onClose,
  children,
}: PopupMenuProps) => {

  if (anchor == null) return null

  const rect = anchor.getBoundingClientRect()

  return (
    <>
      {open && (
        <>
          <div
            className={styles.overlay}
            onClick={onClose}
          ></div>
          <div className={styles.popup} style={{
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          }}>
            {children}
          </div>
        </>
      )}
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
