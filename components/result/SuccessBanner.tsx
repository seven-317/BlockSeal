export function SuccessBanner() {
  return (
    <div className="success-banner">
      <div className="check-ring">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </div>
      <div className="success-text">
        <div className="t">加密成功 · 已記錄上鏈</div>
        <div className="s">Sealed at 2026-06-09 14:32:07 UTC · Block #5,738,291</div>
      </div>
    </div>
  )
}
