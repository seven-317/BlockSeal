'use client'
import { useTranslations } from 'next-intl'

interface ChainCardProps {
  txHash: string
  showToast: (msg: string) => void
}

export function ChainCard({ txHash, showToast }: ChainCardProps) {
  const t = useTranslations('chainCard')

  const copyHash = async () => {
    try { await navigator.clipboard.writeText(txHash) } catch {}
    showToast(t('copied'))
  }

  const sealedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  return (
    <div className="card chain-card">
      <div className="chain-head">
        <h3 className="section-title" style={{ margin: 0 }}>{t('title')}</h3>
        <span className="chain-net"><span className="dot" /> Ethereum · Sepolia</span>
      </div>

      <div className="chain-row">
        <div className="label">{t('label_tx')}</div>
        <div className="val">
          <span className="hash">{txHash}</span>
          <button className="icon-btn" title={t('copy_hash')} onClick={copyHash}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="chain-row">
        <div className="label">{t('label_chain')}</div>
        <div className="val">
          <span className="status"><span className="dot" /> SUBMITTED</span>
          <span className="confirms">Sepolia</span>
        </div>
      </div>

      <div className="chain-row">
        <div className="label">封印時間</div>
        <div className="val" style={{ fontSize: 12, color: 'var(--text-2)' }}>{sealedAt}</div>
      </div>

      <a
        className="explorer-btn"
        href={`https://sepolia.etherscan.io/tx/${txHash}`}
        target="_blank"
        rel="noopener"
      >
        <span className="l">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {t('verify')}
        </span>
        <span className="r">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7" /><path d="M7 7h10v10" />
          </svg>
        </span>
      </a>
    </div>
  )
}
