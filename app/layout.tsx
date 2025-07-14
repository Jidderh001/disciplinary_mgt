import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Disciplinary System',
  description: 'created for managing student disciplinary actions',
  
=======
  title: "Disciplinary System Dashboard", // Change this line
  description: "Created with v0",
    generator: 'v0.dev'
>>>>>>> 5e84ce4bbdf3fe1e97b7bb09286fff8e6e567135
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
