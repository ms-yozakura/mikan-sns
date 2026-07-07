'use client'

import React, { createContext, useContext, useState, ReactNode, } from 'react'
import { Placement, PopupMenu } from '@/shared/ui/PopupMenu'



type PopupMenuContextType = {
  openPopupMenu: (event: React.MouseEvent<HTMLElement>, placement: Placement, children: React.ReactNode) => void
  closePopupMenu: () => void
  popupMenuOpen: boolean
}

const PopupMenuContext = createContext<PopupMenuContextType | null>(null)


export function PopupMenuProvider({
  children,
}: {
  children: ReactNode
}) {

  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [content, setContent] = useState<ReactNode>(null)
  const [placement, setPlacement] = useState<Placement>("bottom-start")
  const [popupMenuOpen, setPopupMenuOpen] = useState<boolean>(false)

  const openPopupMenu = (
    event: React.MouseEvent<HTMLElement>,
    placement: Placement,
    children: React.ReactNode
  ) => {
    setAnchor(event.currentTarget)
    setContent(children)
    setPopupMenuOpen(true)
    setPlacement(placement)
  }

  function closePopupMenu() {
    setAnchor(null)
    setContent(null)
    setPopupMenuOpen(false)
  }



  return (
    <PopupMenuContext.Provider value={{ openPopupMenu, closePopupMenu, popupMenuOpen }}>
      {children}
      <PopupMenu
        anchor={anchor}
        open={anchor !== null}
        placement={placement}
        onClose={closePopupMenu}
      >
        {content}
      </PopupMenu>
    </PopupMenuContext.Provider>
  )
}


export function usePopupMenu() {
  const context = useContext(PopupMenuContext)
  if (!context) {
    throw new Error('usePopupMenu must be inside PopupMenuProvider')
  }
  return context
}

