'use client'
import { useRef, useState } from 'react'
import { useCountdown } from '@/hooks/useCountdown'
import { decryptMessage, fragmentNeedsPassword } from '@/lib/crypto'

interface VaultCardProps {
  id?: string        // real message id (from /v/[id] page)
  fragment?: string  // window.location.hash
}

const DEMO_TEXT =
  '銀行密碼提醒：保險箱密碼 7842-3905\n本月帳單帳戶餘額：USD 12,408.55\n\n如果你在 24 小時內沒收到我的電話，\n請聯絡王律師 +886-2-2718-0042，\n並告知他「藍色信封」這個關鍵字。'
const DEMO_HASH = '5,738,291'

export function VaultCard({ id, fragment }: VaultCardProps) {
  const isDemoMode = !id

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
        // 1. Fetch ciphertext from API
        const res = await fetch(`/api/open/${id}`)
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error ?? 'fetch failed')
        }
        const data = await res.json()

        // 2. Decrypt in browser
        const result = await decryptMessage(data.ciphertextBase64, fragment, needsPassword ? pwdInput : undefined)
        plaintext = result.plaintext
        isVerified = result.localHash === data.cipherHash
        setTxHash(data.txHash)

        // 3. Consume (delete from server, mark opened)
        await fetch(`/api/open/${id}/consume`, { method: 'POST' })
      }

      setVerified(isVerified || isDemoMode)
      setUnlocked(true)
      setLoading(false)
      typeOut(plaintext, 14)
    } catch (err: unknown) {
      setLoading(false)
      const msg = err instanceof Error ? err.message : 'unknown error'
      if (msg === 'already opened') setError('此訊息已被開啟，無法再次讀取。')
      else if (msg === 'expired') setError('此訊息已過期。')
      else if (msg === 'not found') setError('找不到此訊息，可能已被銷毀。')
      else setError(`解密失敗：${msg}`)
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
            <div className="t">{unlocked ? '已解密 · 訊息僅顯示一次' : '加密訊息 · 等待解鎖'}</div>
            <div className="s">
              {isDemoMode ? 'DEMO MODE · FROM 0x9f…4c21' : `ID ${id?.slice(0, 8)}… · SEPOLIA`}
            </div>
          </div>
        </div>
        <span className="chain-net">
          <span className="dot" />
          {isDemoMode ? 'DEMO' : 'VERIFIED · Sepolia'}
        </span>
      </div>

      {/* Locked state */}
      <div className="locked">
        <div className="lock-vis">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2>端到端加密訊息</h2>
        <p>
          本訊息在傳送端的瀏覽器內完成加密，伺服器
          <b style={{ color: 'var(--text)' }}>不保留任何備份</b>。
          一旦解鎖，內容將立即從伺服器銷毀，僅留下區塊鏈上的雜湊存證。
        </p>
        <div className="promises">
          {['伺服器零知識', '閱讀後消失', '鏈上完整性驗證', 'AES-256-GCM'].map(label => (
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
              此訊息受密碼保護，請輸入密碼後解鎖
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="輸入密碼…"
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
          <span className="lbl">{loading ? '解密中…' : '解鎖訊息'}</span>
        </button>
        <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
          按下後即視為您已閱讀，訊息將被銷毀。
        </div>
      </div>

      {/* Unlocked state */}
      <div className="unlocked">
        <div className="msg-meta">
          <span className="lbl">DECRYPTED MESSAGE</span>
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
              <div className="t">{verified ? '訊息完整性已驗證' : '完整性驗證失敗'}</div>
              <div className="s">SHA-256 雜湊{verified ? '與鏈上紀錄一致' : '不符，請注意'}</div>
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
                於 Etherscan 驗證 &rarr;
              </a>
            )}
          </div>
        </div>

        <div className="self-destruct">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
          </svg>
          離開此頁面後，訊息將永久消失。剩餘 <span className="count">{countdown}</span>
        </div>
      </div>
    </div>
  )
}
