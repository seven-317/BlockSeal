'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { DEMO_TEXT, MessageEditor } from './MessageEditor'

const DEMO_TEXTS: Record<string, string> = {
  'zh-TW': '銀行密碼提醒：保險箱密碼 7842-3905\n本月帳單帳戶餘額：USD 12,408.55\n\n如果你在 24 小時內沒收到我的電話，\n請聯絡王律師 +886-2-2718-0042，\n並告知他「藍色信封」這個關鍵字。',
  'en': 'Bank reminder: Safe combination 7842-3905\nCurrent account balance: USD 12,408.55\n\nIf you haven\'t heard from me within 24 hours,\nplease contact Attorney Wang at +886-2-2718-0042\nand mention the keyword "Blue Envelope".',
}
import { OptionChips } from './OptionChips'
import { ComposeSidebar } from './ComposeSidebar'
import { encryptMessage } from '@/lib/crypto'

interface ComposeScreenProps {
  show: boolean
  onEncrypt: (sealData: { id: string; txHash: string; shareUrl: string }) => void
}

export function ComposeScreen({ show, onEncrypt }: ComposeScreenProps) {
  const t = useTranslations('compose')
  const locale = useLocale()
  const [message, setMessage] = useState(() => DEMO_TEXTS[locale] ?? DEMO_TEXTS['en'])
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEncrypt = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { ciphertextBase64, cipherHash, shareFragment } = await encryptMessage(message, password || undefined)

      const res = await fetch('/api/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertextBase64, cipherHash }),
      })

      if (!res.ok) throw new Error(await res.text())
      const { id, txHash } = await res.json()

      const shareUrl = `${window.location.origin}/v/${id}#${shareFragment}`

      setLoading(false)
      onEncrypt({ id, txHash, shareUrl })
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : t('error'))
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
            <span>{t('crumb.system')}</span><span className="sep">/</span>
            <span>{t('crumb.compose')}</span><span className="sep">/</span>
            <span className="cur">{t('crumb.new')}</span>
          </div>
          <h1 className="title" style={{ marginTop: 12 }}>
            {t.rich('title', { em: chunks => <em>{chunks}</em> })}
          </h1>
          <p className="subtitle">{t('subtitle')}</p>
        </div>
        <div className="step-indicator">
          <div className="step active"><span className="n">1</span><span>{t('steps.input')}</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--border)' }} />
          <div className="step"><span className="n">2</span><span>{t('steps.seal')}</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--border)' }} />
          <div className="step"><span className="n">3</span><span>{t('steps.share')}</span></div>
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
              {t('btn_clear')}
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
              <span className="lbl">{loading ? t('encrypting') : t('btn_encrypt')}</span>
            </button>
          </div>
        </div>
        <ComposeSidebar />
      </div>
    </section>
  )
}
