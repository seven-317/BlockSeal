'use client'
import { useState } from 'react'
import { DEMO_TEXT, MessageEditor } from './MessageEditor'
import { OptionChips } from './OptionChips'
import { ComposeSidebar } from './ComposeSidebar'
import { encryptMessage } from '@/lib/crypto'

interface ComposeScreenProps {
  show: boolean
  onEncrypt: (sealData: { id: string; txHash: string; shareUrl: string }) => void
}

export function ComposeScreen({ show, onEncrypt }: ComposeScreenProps) {
  const [message, setMessage] = useState(DEMO_TEXT)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEncrypt = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError(null)

    try {
      // 1. Encrypt in browser (AES-256-GCM, optionally password-wrapped)
      const { ciphertextBase64, cipherHash, shareFragment } = await encryptMessage(message, password || undefined)

      // 2. Send ciphertext + hash to server (key never leaves browser)
      const res = await fetch('/api/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertextBase64, cipherHash }),
      })

      if (!res.ok) throw new Error(await res.text())
      const { id, txHash } = await res.json()

      // 3. Compose share URL — key lives only in the fragment
      const shareUrl = `${window.location.origin}/v/${id}#${shareFragment}`

      setLoading(false)
      onEncrypt({ id, txHash, shareUrl })
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : '加密失敗，請稍後再試。')
    }
  }

  const handleClear = () => {
    setMessage('')
    setError(null)
  }

  return (
    <section className={`screen${show ? ' show' : ''}`} id="screen-compose">
      <div className="screen-meta">
        <div>
          <div className="crumb">
            <span>SYSTEM</span><span className="sep">/</span>
            <span>COMPOSE</span><span className="sep">/</span>
            <span className="cur">NEW MESSAGE</span>
          </div>
          <h1 className="title" style={{ marginTop: 12 }}>
            將你的訊息<em>封印</em>於鏈上。
          </h1>
          <p className="subtitle">
            在裝置上完成加密，僅將密文雜湊寫入鏈上作為存證。我們的伺服器永遠看不到原文。
          </p>
        </div>
        <div className="step-indicator">
          <div className="step active"><span className="n">1</span><span>輸入</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--border)' }} />
          <div className="step"><span className="n">2</span><span>封印</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--border)' }} />
          <div className="step"><span className="n">3</span><span>分享</span></div>
        </div>
      </div>

      <div className="composer-grid">
        <div>
          <div className="card composer">
            <MessageEditor value={message} onChange={setMessage} />
            <div className="editor-foot">
              <OptionChips password={password} onPasswordChange={setPassword} />
            </div>
          </div>

          {error && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 10,
              background: 'var(--bg-2)', border: '1px solid var(--danger)',
              color: 'var(--danger)', fontFamily: 'var(--mono)', fontSize: 12,
            }}>
              {error}
            </div>
          )}

          <div className="actions">
            <button className="btn btn-ghost" onClick={handleClear}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              清空
            </button>
            <button
              className={`btn btn-primary${loading ? ' loading' : ''}`}
              onClick={handleEncrypt}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="lbl">加密並上鏈</span>
            </button>
          </div>
        </div>
        <ComposeSidebar />
      </div>
    </section>
  )
}
