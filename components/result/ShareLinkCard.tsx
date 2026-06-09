'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import QRCode from 'qrcode'

interface ShareLinkCardProps {
  shareUrl: string
  showToast: (msg: string) => void
}

export function ShareLinkCard({ shareUrl, showToast }: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const t = useTranslations('shareLink')

  useEffect(() => {
    if (!shareUrl) return
    QRCode.toDataURL(shareUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {})
  }, [shareUrl])

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareUrl) } catch {}
    setCopied(true)
    showToast(t('copied'))
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="card link-card">
      <h3 className="section-title">{t('title')}</h3>
      <div className="link-row">
        <input
          className="url"
          readOnly
          value={shareUrl}
          aria-label={t('title')}
        />
        <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span className="lbl">{copied ? t('copied') : t('copy')}</span>
        </button>
      </div>

      <div className="meta-row">
        <div className="meta"><div className="k">{t('meta_size')}</div><div className="v">{t('meta_size_val')}</div></div>
        <div className="meta"><div className="k">{t('meta_expire')}</div><div className="v">{t('meta_expire_val')}</div></div>
        <div className="meta"><div className="k">{t('meta_chain')}</div><div className="v">Sepolia</div></div>
      </div>

      <div className="qr-wrap">
        <div className="qr">
          {qrDataUrl
            ? <img src={qrDataUrl} alt="QR Code" width={100} height={100} style={{ display: 'block' }} />
            : <div style={{ width: 100, height: 100, background: 'var(--bg-2)', borderRadius: 4 }} />
          }
        </div>
        <div className="qr-text">
          <div className="t">{t('qr_title')}</div>
          <div className="s">{t('qr_sub')}</div>
          <div className="warn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {t('qr_warn')}
          </div>
        </div>
      </div>
    </div>
  )
}
