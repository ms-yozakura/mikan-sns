
import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/globals.css'

import { ModalProvider } from "@/providers/ModalProvider"


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  )
}
