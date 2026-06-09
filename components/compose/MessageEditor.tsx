'use client'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface MessageEditorProps {
  value: string
  onChange: (v: string) => void
}

export function MessageEditor({ value, onChange }: MessageEditorProps) {
  const t = useTranslations('editor')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const lines = Math.max(1, value.split('\n').length)
  const charCount = value.length

  useEffect(() => {
    const ta = textareaRef.current
    const gt = gutterRef.current
    if (!ta || !gt) return
    const lh = parseFloat(getComputedStyle(ta).lineHeight)
    const visible = Math.max(lines, Math.floor((ta.clientHeight - 32) / lh))
    const total = Math.max(lines, visible)
    gt.innerHTML = Array.from({ length: total }, (_, i) =>
      `<div>${String(i + 1).padStart(2, '0')}</div>`
    ).join('')
  }, [value, lines])

  useEffect(() => {
    const handler = () => {
      const ta = textareaRef.current
      const gt = gutterRef.current
      if (!ta || !gt) return
      const lh = parseFloat(getComputedStyle(ta).lineHeight)
      const lineCount = Math.max(1, ta.value.split('\n').length)
      const visible = Math.max(lineCount, Math.floor((ta.clientHeight - 32) / lh))
      gt.innerHTML = Array.from({ length: Math.max(lineCount, visible) }, (_, i) =>
        `<div>${String(i + 1).padStart(2, '0')}</div>`
      ).join('')
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div>
      <div className="editor-head">
        <div className="lbl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
          {t('label')}
        </div>
        <div className="counter">
          <b>{charCount}</b> / 4096 {t('unit_chars')} · <b>{lines}</b> {t('unit_lines')}
        </div>
      </div>

      <div className="editor">
        <div className="gutter" ref={gutterRef}>
          <div>01</div>
        </div>
        <textarea
          ref={textareaRef}
          className="input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={t('placeholder')}
          spellCheck={false}
          maxLength={4096}
        />
      </div>
    </div>
  )
}

export const DEMO_TEXT = ''
