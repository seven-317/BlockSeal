'use client'
import { useState } from 'react'

const CHIPS = [
  {
    id: 'once',
    defaultOn: true,
    label: '閱讀一次',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      </svg>
    ),
  },
  {
    id: 'expire',
    label: '24 小時後失效',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: 'pwd',
    label: '加上密碼',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: 'chain',
    label: '上鏈存證',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
]

interface OptionChipsProps {
  password: string
  onPasswordChange: (v: string) => void
}

export function OptionChips({ password, onPasswordChange }: OptionChipsProps) {
  const [active, setActive] = useState<Set<string>>(
    new Set(CHIPS.filter(c => c.defaultOn).map(c => c.id))
  )
  const [showPwd, setShowPwd] = useState(false)

  const toggle = (id: string) => {
    setActive(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    if (id === 'pwd') {
      const willBeOn = !active.has('pwd')
      if (!willBeOn) onPasswordChange('')
    }
  }

  const pwdOn = active.has('pwd')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="opts">
        {CHIPS.map(chip => (
          <button
            key={chip.id}
            className={`chip${active.has(chip.id) ? ' on' : ''}`}
            onClick={() => toggle(chip.id)}
          >
            {chip.icon}
            {chip.label}
          </button>
        ))}
      </div>

      {pwdOn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2 }}>
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder="輸入密碼（收件人需知道此密碼才能解密）"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--text)',
              fontFamily: 'var(--mono)',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowPwd(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', padding: 4, flexShrink: 0,
            }}
            title={showPwd ? '隱藏' : '顯示'}
          >
            {showPwd ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
