'use client'
import { useCallback, useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('blockseal-theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      localStorage.setItem('blockseal-theme', next)
      return next
    })
  }, [])

  return { theme, toggle }
}
