export function DecryptSidebar() {
  return (
    <aside className="decrypt-side">
      <div className="card side-stat">
        <div className="k">雜湊匹配</div>
        <div className="v ok">MATCHED <span className="small">SHA-256</span></div>
      </div>
      <div className="card side-stat">
        <div className="k">區塊確認</div>
        <div className="v">12 <span className="small">/ 12</span></div>
      </div>
      <div className="card side-stat">
        <div className="k">封印時間</div>
        <div className="v" style={{ fontSize: 14 }}>
          2026-06-09<br /><span className="small" style={{ margin: 0 }}>14:32 UTC</span>
        </div>
      </div>
      <div className="card side-card">
        <h3>它如何運作</h3>
        <div className="flow">
          <div className="flow-step"><span className="ico">01</span><span>從 URL # 取得金鑰</span></div>
          <div className="flow-step"><span className="ico">02</span><span>下載密文</span></div>
          <div className="flow-step"><span className="ico">03</span><span>裝置端解密</span></div>
          <div className="flow-step"><span className="ico">04</span><span>對照鏈上雜湊</span></div>
          <div className="flow-step"><span className="ico">05</span><span>銷毀伺服器副本</span></div>
        </div>
      </div>
    </aside>
  )
}
