import { VaultCard } from './VaultCard'
import { DecryptSidebar } from './DecryptSidebar'

interface DecryptScreenProps {
  show: boolean
}

export function DecryptScreen({ show }: DecryptScreenProps) {
  return (
    <section className={`screen${show ? ' show' : ''}`} id="screen-decrypt">
      <div className="screen-meta">
        <div>
          <div className="crumb">
            <span>SYSTEM</span><span className="sep">/</span>
            <span>OPEN</span><span className="sep">/</span>
            <span className="cur">/v/4a8d2c…</span>
          </div>
          <h1 className="title" style={{ marginTop: 12 }}>
            <em>有人</em>為你封印了一段訊息。
          </h1>
          <p className="subtitle">
            在你按下解鎖之前，沒有任何人 - 包含 BlockSeal - 看得見內容。閱讀後即刻消失。
          </p>
        </div>
        <div className="step-indicator">
          <div className="step done"><span className="n">✓</span><span>已封印</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
          <div className="step done"><span className="n">✓</span><span>已送達</span></div>
          <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
          <div className="step active"><span className="n">3</span><span>待解鎖</span></div>
        </div>
      </div>

      <div className="decrypt-wrap">
        <VaultCard />
        <DecryptSidebar />
      </div>
    </section>
  )
}
