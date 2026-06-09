import type { Metadata } from 'next'
import { JetBrains_Mono, Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BlockSeal · 鏈諭',
  description: '端到端加密訊息，僅將密文雜湊寫入鏈上作為存證。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="zh-Hant"
      data-theme="dark"
      suppressHydrationWarning
      className={cn(jetbrainsMono.variable, inter.variable, "font-sans", geist.variable)}
    >
      <head>
        {/* restore theme from localStorage before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('blockseal-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
