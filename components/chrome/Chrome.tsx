'use client'
import { useGasTicker } from '@/hooks/useGasTicker'
import { useTheme } from '@/hooks/useTheme'

type Screen = 'compose' | 'result' | 'decrypt'

interface ChromeProps {
  screen: Screen
  onScreenChange: (s: Screen) => void
}

const SUN_PATH =
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'
const MOON_PATH = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />'

const TABS: { id: Screen; label: string }[] = [
  { id: 'compose', label: '01 · COMPOSE' },
  { id: 'result', label: '02 · SEAL' },
  { id: 'decrypt', label: '03 · OPEN' },
]

export function Chrome({ screen, onScreenChange }: ChromeProps) {
  const gasLabel = useGasTicker()
  const { theme, toggle } = useTheme()

  return (
    <header className="chrome">
      <div className="brand">
        <div className="seal" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="name">BlockSeal · 鏈諭</div>
          <div className="tag">END-TO-END · ON-CHAIN · ZERO-KNOWLEDGE</div>
        </div>
      </div>

      <nav className="nav-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${screen === tab.id ? ' active' : ''}`}
            role="tab"
            aria-selected={screen === tab.id}
            onClick={() => onScreenChange(tab.id)}
          >
            <span className="dot" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="chrome-right">
        <div className="pill">
          <span className="pulse" />
          <span>{gasLabel}</span>
        </div>
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: theme === 'dark' ? MOON_PATH : SUN_PATH }}
          />
        </button>
      </div>
    </header>
  )
}
