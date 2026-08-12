'use client'

import { createContext, useContext, useState, ReactNode, } from 'react'
import { Modal } from '@/shared/ui/Modal'
type ModalArgs = {
  title?: string
  children: ReactNode
  className?: string
}

type ModalContextType = {
  openModal: (options: ModalArgs) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)


export function ModalProvider({
  children,
}: {
  children: ReactNode
}) {

  const [modal, setModal] = useState<ModalArgs | null>(null)
  const [isClosing, setIsClosing] = useState(false)


  function openModal(options: ModalArgs) {
    setIsClosing(false)
    setModal(options)
  }


  function closeModal() {
    setIsClosing(true)
  }


  function handleExited() {
    setModal(null)
    setIsClosing(false)
  }


  return (
    <ModalContext.Provider value={{ openModal, closeModal, }}>
      {children}
      {modal && (
        <Modal
          open={!isClosing}
          onClose={closeModal}
          onExited={handleExited}
          className={modal.className}
        >
          {modal.title && (
            <h3>{modal.title}</h3>
          )}
          {modal.children}
        </Modal>
      )}
    </ModalContext.Provider>
  )
}


export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be inside ModalProvider')
  }
  return context
}
