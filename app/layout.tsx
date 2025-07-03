import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Alterra - AI Companions",
  description: "Create your perfect digital companion, powered by advanced AI.",
  viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white overflow-hidden">{children}</body>
    </html>
  )
}
