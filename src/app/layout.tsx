import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/globals.css'

import { ModalProvider } from "@/providers/ModalProvider"
import { PopupMenuProvider } from '@/providers/PopupMenuProvider'
import { ServiceWorkerRegistration } from '@/shared/pwa/ServiceWorkerRegistration'
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fff8ee",
}

export const metadata: Metadata = {
  title: "MikanSNS",
  applicationName: "MikanSNS",
  description: "みかんを記録して、みかん好きとつながるSNS。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MikanSNS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <ServiceWorkerRegistration />
        <ModalProvider>
          <PopupMenuProvider>
            {children}
          </PopupMenuProvider>
        </ModalProvider>
      </body>
    </html>
  )
}
