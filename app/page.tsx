'use client'
import { useEffect, useRef, useState } from 'react'
import { AmbientBg } from '@/components/ui/AmbientBg'
import { Chrome } from '@/components/chrome/Chrome'
import { ComposeScreen } from '@/components/compose/ComposeScreen'
import { ResultScreen } from '@/components/result/ResultScreen'
import { DecryptScreen } from '@/components/decrypt/DecryptScreen'
import { Footer } from '@/components/ui/Footer'
import { Toast } from '@/components/ui/Toast'

type Screen = 'compose' | 'result' | 'decrypt'
const ORDER: Screen[] = ['compose', 'result', 'decrypt']

interface SealData {
  id: string
  txHash: string
  shareUrl: string
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('compose')
  const [sealData, setSealData] = useState<SealData | null>(null)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ show: true, msg })
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      const cur = ORDER.indexOf(screen)
      if (e.key === 'ArrowRight') handleScreenChange(ORDER[Math.min(ORDER.length - 1, cur + 1)])
      if (e.key === 'ArrowLeft') handleScreenChange(ORDER[Math.max(0, cur - 1)])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [screen])

  const handleScreenChange = (s: Screen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setScreen(s)
  }

  const handleEncrypt = (data: SealData) => {
    setSealData(data)
    handleScreenChange('result')
  }

  return (
    <>
      <AmbientBg />
      <Chrome screen={screen} onScreenChange={handleScreenChange} />
      <main>
        <ComposeScreen show={screen === 'compose'} onEncrypt={handleEncrypt} />
        <ResultScreen show={screen === 'result'} sealData={sealData} showToast={showToast} />
        <DecryptScreen show={screen === 'decrypt'} />
      </main>
      <Footer />
      <Toast show={toast.show} msg={toast.msg} />
    </>
  )
}
