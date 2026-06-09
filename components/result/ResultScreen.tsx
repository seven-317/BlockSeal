'use client'
import { useTranslations } from 'next-intl'
import { SuccessBanner } from './SuccessBanner'
import { ShareLinkCard } from './ShareLinkCard'
import { ChainCard } from './ChainCard'

interface SealData {
  id: string
  txHash: string
  shareUrl: string
}

interface ResultScreenProps {
  show: boolean
  sealData: SealData | null
  showToast: (msg: string) => void
}

const DEMO_DATA: SealData = {
  id: 'demo',
  txHash: '0x4a8d2c7f1e9b3a06d5c8f24e1b9a7c3d6e2f5a8b4c7d1e0f3a6b9c2d5e8f1a4b',
  shareUrl: 'https://block-seal.vercel.app/v/demo#k=GhT7nQz9pVxR2KbWfL3sAeXm',
}

export function ResultScreen({ show, sealData, showToast }: ResultScreenProps) {
  const isDemo = sealData === null
  const data = sealData ?? DEMO_DATA
  const t = useTranslations('result')

  return (
    <section className={`screen${show ? ' show' : ''}`} id="screen-result">
      <div className="screen-meta">
        <div>
          <div className="crumb">
            <span>{t('crumb.system')}</span><span className="sep">/</span>
            <span>{t('crumb.seal')}</span><span className="sep">/</span>
            <span className="cur">SEALED · {data.txHash.slice(0, 10)}…</span>
            {isDemo && <span style={{ marginLeft: 8, padding: '1px 7px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--mono)', background: 'var(--bg-3)', color: 'var(--text-2)', border: '1px solid var(--border)', letterSpacing: '0.05em' }}>DEMO</span>}
          </div>
          <h1 className="title" style={{ marginTop: 12 }}>
            {t.rich('title', { em: chunks => <em>{chunks}</em> })}
          </h1>
          <p className="subtitle">{t('subtitle')}</p>
        </div>
        <div className="step-indicator">
          <div className="step done"><span className="n">✓</span><span>{t('steps.input')}</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
          <div className="step active"><span className="n">2</span><span>{t('steps.seal')}</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--border)' }} />
          <div className="step"><span className="n">3</span><span>{t('steps.share')}</span></div>
        </div>
      </div>

      <SuccessBanner />

      <div className="result-grid">
        <div>
          <ShareLinkCard shareUrl={data.shareUrl} showToast={showToast} />
        </div>
        <div>
          <ChainCard txHash={data.txHash} showToast={showToast} />
        </div>
      </div>
    </section>
  )
}
