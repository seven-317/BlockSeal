'use client'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCountdown } from '@/hooks/useCountdown'
import { decryptMessage, fragmentNeedsPassword } from '@/lib/crypto'

interface VaultCardProps {
  id?: string
  fragment?: string
}

const DEMO_TEXT =
  '銀行密碼提醒：保險箱密碼 7842-3905\n本月帳單帳戶餘額：USD 12,408.55\n\n如果你在 24 小時內沒收到我的電話，\n請聯絡王律師 +886-2-2718-0042，\n並告知他「藍色信封」這個關鍵字。'
const DEMO_HASH = '5,738,291'

export function VaultCard({ id, fragment }: VaultCardProps) {
  const isDemoMode = !id
  const t = useTranslations('vault')

  const needsPassword = !isDemoMode && !!fragment && fragmentNeedsPassword(fragment)

  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [typing, setTyping] = useState(false)
  const [blockNum, setBlockNum] = useState(DEMO_HASH)
  const [txHash, setTxHash] = useState('0x4a8d2c7f1e9b3a06d5c8f24e1b9a7c3d6e2f5a8b4c7d1e0f3a6b9c2d5e8f1a4b')
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pwdInput, setPwdInput] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdown = useCountdown(120, unlocked)

  const handleUnlock = async () => {
    setLoading(true)
    setError(null)

    try {
      let plaintext = DEMO_TEXT
      let isVerified = false

      if (!isDemoMode && id && fragment) {
        const res = await fetch(`/api/open/${id}`)
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error ?? 'fetch failed')
        }
        const data = await res.json()

        const result = await decryptMessage(data.ciphertextBase64, fragment, needsPassword ? pwdInput : undefined)
        plaintext = result.plaintext
        isVerified = result.localHash === data.cipherHash
        setTxHash(data.txHash)

        await fetch(`/api/open/${id}/consume`, { method: 'POST' })
      }

      setVerified(isVerified || isDemoMode)
      setUnlocked(true)
      setLoading(false)
      typeOut(plaintext, 14)
    } catch (err: unknown) {
      setLoading(false)
      const msg = err instanceof Error ? err.message : 'unknown error'
      if (msg === 'already opened') setError(t('err_opened'))
      else if (msg === 'expired') setError(t('err_expired'))
      else if (msg === 'not found') setError(t('err_notfound'))
      else setError(`${t('err_decrypt')}${msg}`)
    }
  }

  const typeOut = (text: string, speed: number) => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current)
    setDisplayedText('')
    setTyping(true)
    let i = 0
    typeTimerRef.current = setInterval(() => {
      i++
      setDisplayedText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(typeTimerRef.current!)
        setTyping(false)
      }
    }, speed)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const LOCK_ICON = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
  const UNLOCK_ICON = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  )

  return (
    <div className={`card vault${unlocked ? ' is-unlocked' : ''}`}>
      <div className="vault-head">
        <div className="left">
          <div className="seal-mini">{unlocked ? UNLOCK_ICON : LOCK_ICON}</div>
          <div>
            <div className="t">{unlocked ? t('unlocked_title') : t('locked_title')}</div>
            <div className="s">
              {isDemoMode ? t('locked_sub_demo') : `ID ${id?.slice(0, 8)}… · SEPOLIA`}
            </div>
          </div>
        </div>
        <span className="chain-net">
          <span className="dot" />
          {isDemoMode ? t('chain_demo') : t('chain_verified')}
        </span>
      </div>

      <div className="locked">
        <div className="lock-vis">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2>{t('h2')}</h2>
        <p>
          {t.rich('desc', { b: chunks => <b style={{ color: 'var(--text)' }}>{chunks}</b> })}
        </p>
        <div className="promises">
          {([t('promise_zero'), t('promise_once'), t('promise_chain'), t('promise_aes')] as string[]).map(label => (
            <span className="promise" key={label}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {label}
            </span>
          ))}
        </div>

        {needsPassword && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 8 }}>
              {t('pwd_label')}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder={t('pwd_placeholder')}
                value={pwdInput}
                onChange={e => setPwdInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && handleUnlock()}
                style={{
                  flex: 1,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => setShowPwd(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}
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
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 16px', borderRadius: 10,
            background: 'var(--bg-2)', border: '1px solid var(--danger)',
            color: 'var(--danger)', fontFamily: 'var(--mono)', fontSize: 12,
          }}>
            {error}
          </div>
        )}

        <button
          className={`unlock-btn${loading ? ' loading' : ''}`}
          onClick={handleUnlock}
          onMouseMove={handleMouseMove}
          disabled={loading || (needsPassword && !pwdInput)}
        >
          {UNLOCK_ICON}
          <span className="lbl">{loading ? t('unlocking') : t('unlock')}</span>
        </button>
        <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
          {t('confirm')}
        </div>
      </div>

      <div className="unlocked">
        <div className="msg-meta">
          <span className="lbl">{t('decrypted_label')}</span>
          <span className="from">{isDemoMode ? 'DEMO' : `ID ${id?.slice(0, 8)}…`}</span>
        </div>
        <div className={`message${typing ? ' typing' : ''}`}>{displayedText}</div>

        <div className="verify-bar">
          <div className="left">
            <div className="badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="t">{verified ? t('integrity_ok') : t('integrity_fail')}</div>
              <div className="s">{verified ? t('integrity_ok_sub') : t('integrity_fail_sub')}</div>
            </div>
          </div>
          <div className="right">
            <div>TX: {txHash.slice(0, 10)}…</div>
            {!isDemoMode && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener"
              >
                {t('etherscan')} &rarr;
              </a>
            )}
          </div>
        </div>

        <div className="self-destruct">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
          </svg>
          {t('destruct')} <span className="count">{countdown}</span>
        </div>
      </div>
    </div>
  )
}
