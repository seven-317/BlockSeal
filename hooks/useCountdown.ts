'use client'
import { useEffect, useRef, useState } from 'react'

export function useCountdown(initialSeconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) return
    setRemaining(initialSeconds)
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [active, initialSeconds])

  const m = String(Math.floor(remaining / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')
  return `${m}:${s}`
}
