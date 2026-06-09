export function ComposeSidebar() {
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
        <h3>處理流程</h3>
        <div className="flow">
          <div className="flow-step"><span className="ico">01</span><span>在裝置端產生隨機金鑰</span></div>
          <div className="flow-step"><span className="ico">02</span><span>AES-GCM 加密原文</span></div>
          <div className="flow-step"><span className="ico">03</span><span>計算密文雜湊</span></div>
          <div className="flow-step"><span className="ico">04</span><span>寫入區塊鏈存證</span></div>
          <div className="flow-step"><span className="ico">05</span><span>產生分享連結</span></div>
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
