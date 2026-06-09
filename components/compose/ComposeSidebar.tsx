'use client'
import { useTranslations } from 'next-intl'

export function ComposeSidebar() {
  const t = useTranslations('sidebar_compose')

  return (
    <aside className="side">
      <div className="card side-card">
        <h3>{t('specs_title')}</h3>
        <div className="kv"><span className="k">{t('spec_algo')}</span><span className="v accent">AES-256-GCM</span></div>
        <div className="kv"><span className="k">{t('spec_kex')}</span><span className="v">X25519</span></div>
        <div className="kv"><span className="k">{t('spec_sign')}</span><span className="v">Ed25519</span></div>
        <div className="kv"><span className="k">{t('spec_chain')}</span><span className="v">Ethereum L2</span></div>
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
        <h3>{t('privacy_title')}</h3>
        <div style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: '1.6' }}>
          {t('privacy_body')}
        </div>
      </div>
    </aside>
  )
}
