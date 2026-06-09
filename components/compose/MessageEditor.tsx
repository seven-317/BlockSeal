'use client'
import { useEffect, useRef } from 'react'

const DEMO_TEXT =
  '銀行密碼提醒：保險箱密碼 7842-3905\n本月帳單帳戶餘額：USD 12,408.55\n\n如果你在 24 小時內沒收到我的電話，\n請聯絡王律師 +886-2-2718-0042，\n並告知他「藍色信封」這個關鍵字。'

interface MessageEditorProps {
  value: string
  onChange: (v: string) => void
}

export function MessageEditor({ value, onChange }: MessageEditorProps) {
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
          機密訊息內容
        </div>
        <div className="counter">
          <b>{charCount}</b> / 4096 字元 · <b>{lines}</b> 行
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
          placeholder={'在此貼上或輸入你要加密的內容\n\n例如：\n  · 私鑰備份提示\n  · 緊急聯絡資訊\n  · 一段只想說給一個人聽的話'}
          spellCheck={false}
          maxLength={4096}
        />
      </div>
    </div>
  )
}

export { DEMO_TEXT }
