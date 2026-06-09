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
  shareUrl: 'https://blockseal.io/v/demo#k=GhT7nQz9pVxR2KbWfL3sAeXm',
}

export function ResultScreen({ show, sealData, showToast }: ResultScreenProps) {
  const data = sealData ?? DEMO_DATA

  return (
    <section className={`screen${show ? ' show' : ''}`} id="screen-result">
      <div className="screen-meta">
        <div>
          <div className="crumb">
            <span>SYSTEM</span><span className="sep">/</span>
            <span>SEAL</span><span className="sep">/</span>
            <span className="cur">SEALED · {data.txHash.slice(0, 10)}…</span>
          </div>
          <h1 className="title" style={{ marginTop: 12 }}>
            已封印。<em>連結即金鑰。</em>
          </h1>
          <p className="subtitle">
            訊息已在你的瀏覽器完成加密，並寫入區塊鏈作為存證。請妥善保管下方連結。
          </p>
        </div>
        <div className="step-indicator">
          <div className="step done"><span className="n">✓</span><span>輸入</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
          <div className="step active"><span className="n">2</span><span>封印</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--border)' }} />
          <div className="step"><span className="n">3</span><span>分享</span></div>
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
