import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BlockSeal · 鏈諭',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
