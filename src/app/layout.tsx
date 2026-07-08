
import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/globals.css'

import { ModalProvider } from "@/providers/ModalProvider"
import { PopupMenuProvider } from '@/providers/PopupMenuProvider'
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "MikanSNS",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <ModalProvider>
          <PopupMenuProvider>
            {children}
          </PopupMenuProvider>
        </ModalProvider>
      </body>
    </html >
  )
}
