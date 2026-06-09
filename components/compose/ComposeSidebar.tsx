'use client'
import { useTranslations } from 'next-intl'

export function ComposeSidebar() {
  const t = useTranslations('sidebar_compose')

  return (
    <aside className="side">
      <div className="card side-card">
        <h3>加密規格</h3>
        <div className="kv"><span className="k">演算法</span><span className="v accent">AES-256-GCM</span></div>
        <div className="kv"><span className="k">金鑰交換</span><span className="v">X25519</span></div>
        <div className="kv"><span className="k">簽章</span><span className="v">Ed25519</span></div>
        <div className="kv"><span className="k">公鏈</span><span className="v">Ethereum L2</span></div>
      </div>

      <div className="card side-card">
        <h3>{t('how_title')}</h3>
        <div className="flow">
          <div className="flow-step"><span className="ico">01</span><span>{t('step1')}</span></div>
          <div className="flow-step"><span className="ico">02</span><span>{t('step2')}</span></div>
          <div className="flow-step"><span className="ico">03</span><span>{t('step3')}</span></div>
          <div className="flow-step"><span className="ico">04</span><span>{t('step4')}</span></div>
          <div className="flow-step"><span className="ico">05</span><span>{t('step5')}</span></div>
        </div>
      </div>

      <div className="card side-card">
        <h3>隱私保證</h3>
        <div style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: '1.6' }}>
          金鑰僅存在於 URL 的{' '}
          <b style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>#fragment</b> 中，
          瀏覽器不會將它傳送至我們的伺服器。
        </div>
      </div>
    </aside>
  )
}
