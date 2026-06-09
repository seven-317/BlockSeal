'use client'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer>
      <div className="l">
        <span className="ring" />
        <span>BLOCKSEAL · v0.4.2-beta</span>
        <span>·</span>
        <span>BUILD: f8c2e1a</span>
      </div>
      <div className="r">
        <span>NETWORK</span>
        <span>SEPOLIA</span>
        <span>·</span>
        <span>LATENCY 42ms</span>
      </div>
    </footer>
  )
}
