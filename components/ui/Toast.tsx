interface ToastProps {
  show: boolean
  msg: string
}

export function Toast({ show, msg }: ToastProps) {
  return (
    <div className={`toast${show ? ' show' : ''}`} aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5L20 7" />
      </svg>
      <span>{msg}</span>
    </div>
  )
}
