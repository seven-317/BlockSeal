'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AmbientBg } from '@/components/ui/AmbientBg'
import { Chrome } from '@/components/chrome/Chrome'
import { Footer } from '@/components/ui/Footer'
import { VaultCard } from '@/components/decrypt/VaultCard'
import { DecryptSidebar } from '@/components/decrypt/DecryptSidebar'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default function VaultPage({ params }: PageProps) {
  const [id, setId] = useState<string | null>(null)
  const [fragment, setFragment] = useState('')
  const t = useTranslations('vaultPage')

  useEffect(() => {
    params.then(p => setId(p.id))
    setFragment(window.location.hash)
  }, [params])

  return (
    <>
      <AmbientBg />
      <Chrome screen="decrypt" onScreenChange={() => {}} />
      <main>
        <div className="screen-meta">
          <div>
            <div className="crumb">
              <span>SYSTEM</span><span className="sep">/</span>
              <span>OPEN</span><span className="sep">/</span>
              <span className="cur">/v/{id ?? '…'}</span>
            </div>
            <h1 className="title" style={{ marginTop: 12 }}>
              {t.rich('title', { em: chunks => <em>{chunks}</em> })}
            </h1>
            <p className="subtitle">{t('subtitle')}</p>
          </div>
          <div className="step-indicator">
            <div className="step done"><span className="n">✓</span><span>{t('step_sealed')}</span></div>
            <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
            <div className="step done"><span className="n">✓</span><span>{t('step_delivered')}</span></div>
            <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
            <div className="step active"><span className="n">3</span><span>{t('step_waiting')}</span></div>
          </div>
        </div>

        {id && (
          <div className="decrypt-wrap">
            <VaultCard id={id} fragment={fragment} />
            <DecryptSidebar />
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
