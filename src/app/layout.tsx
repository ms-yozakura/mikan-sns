
import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/globals.css'

import { ModalProvider } from "@/providers/ModalProvider"
import { PopupMenuProvider } from '@/providers/PopupMenuProvider'


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
