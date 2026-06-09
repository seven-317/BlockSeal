'use client'
import { useEffect, useState } from 'react'

export function useGasTicker() {
  const [label, setLabel] = useState('SEPOLIA · 0.42 GWEI')

  useEffect(() => {
    const id = setInterval(() => {
      const g = (0.3 + Math.random() * 0.4).toFixed(2)
      setLabel(`SEPOLIA · ${g} GWEI`)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return label
}
