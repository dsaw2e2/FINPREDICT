import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FinPredict - Прогнозирование финансовых рынков",
  description: "Анализ и прогнозирование акций, валют и энергетических компаний с использованием машинного обучения",
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="bg-zinc-950">
      <body className={`font-sans antialiased ${inter.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
