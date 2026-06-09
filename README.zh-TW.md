# BlockSeal · 鏈諭

端到端加密訊息平台，將密文雜湊寫入以太坊鏈上作為不可竄改的存證。訊息在瀏覽器內完成 AES-256-GCM 加密，伺服器永遠看不到明文。

**[English → README.md](./README.md)**

## 功能特色

- **瀏覽器端加密** — AES-256-GCM 透過 Web Crypto API 在裝置上完成，金鑰從不離開瀏覽器
- **鏈上存證** — 密文 SHA-256 雜湊寫入 Ethereum Sepolia 智能合約，任何人可在 Etherscan 驗證
- **Relayer 模式** — 伺服器錢包代付 Gas，使用者不需要錢包或 ETH
- **閱讀一次即銷毀** — 訊息首次解密後立即從伺服器刪除
- **密碼保護** — 可選擇以 PBKDF2（200,000 次迭代）對金鑰再加密，收件人需輸入密碼才能解鎖
- **QR Code 分享** — 自動產生可掃描的 QR Code，金鑰位於 URL fragment，伺服器不會收到

## 技術架構

```
瀏覽器 (加密) ──→ API Route (Supabase 儲存) ──→ Relayer (鏈上存證)
                                                        │
收件人瀏覽器 (解密) ←── API Route (下載密文) ←──────────┘
```

| 層次 | 技術 |
|------|------|
| 框架 | Next.js 16 App Router · React 19 · TypeScript |
| 樣式 | Tailwind CSS v4 · CSS 自訂屬性設計系統 |
| 加密 | Web Crypto API (AES-256-GCM · PBKDF2) |
| 鏈上互動 | viem · Ethereum Sepolia |
| 資料庫 | Supabase (PostgreSQL + Storage) |
| 合約開發 | Solidity 0.8.24 |

## 快速開始

### 環境需求

- Node.js 20+
- Supabase 專案
- Ethereum Sepolia 錢包（含少量測試 ETH）

### 安裝

```bash
git clone https://github.com/seven-317/BlockSeal.git
cd BlockSeal
npm install
```

### 環境變數

```bash
cp .env.local.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Ethereum Sepolia
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
RELAYER_PRIVATE_KEY=0x...        # 伺服器代付 Gas 的錢包
DEPLOYER_PRIVATE_KEY=0x...       # 部署合約用的錢包
CONTRACT_ADDRESS=0x...           # 部署後填入
```

> 取得 Sepolia 測試 ETH：[sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de)

### 初始化資料庫

在 Supabase Dashboard → SQL Editor 執行 `supabase/migrations/001_init.sql` 的內容。

同時在 Supabase → Storage 建立名為 `ciphertexts` 的 **private** bucket。

### 部署智能合約

```bash
node scripts/deploy-simple.mjs
```

執行後複製輸出的 `CONTRACT_ADDRESS=0x...` 填入 `.env.local`。

### 啟動開發伺服器

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)

## 安全設計

### 金鑰永不上傳

```
分享連結結構：
https://example.com/v/{id}#{k=<AES金鑰>&iv=<初始向量>}
                          ↑
                    fragment 不會發送至伺服器
```

### 加上密碼時的流程

```
密碼 + 隨機 salt
      ↓ PBKDF2 (200,000 次)
   wrapping key
      ↓ AES-GCM 包裝
   encrypted AES key  ──→ 存入 URL fragment（salt 與 kiv 一併存入）
```

### 完整資料流

1. 使用者輸入明文 → 瀏覽器產生 AES-256 金鑰 + IV
2. 加密明文 → 計算密文 SHA-256 雜湊
3. 密文上傳至 Supabase Storage；雜湊由 Relayer 寫入鏈上合約
4. 分享連結 = `/v/{id}#{金鑰&IV}`（金鑰在 fragment，伺服器不可見）
5. 收件人開啟連結 → 下載密文 → 在瀏覽器解密 → 驗證雜湊與鏈上一致
6. 呼叫 consume API → 密文從 Storage 刪除、標記已開啟

## 專案結構

```
app/
├── api/
│   ├── seal/route.ts          # 接收密文，上鏈，寫入 DB
│   └── open/[id]/
│       ├── route.ts           # 取得密文（驗證守衛）
│       └── consume/route.ts   # 標記已讀、刪除密文
├── v/[id]/page.tsx            # 分享連結解密頁
└── page.tsx                   # 主頁面

components/
├── compose/                   # 訊息撰寫、加密流程
├── result/                    # 加密結果、QR Code、鏈上資訊
└── decrypt/                   # 解密流程、密碼輸入

lib/
├── crypto.ts                  # Web Crypto API 封裝
├── chain.ts                   # viem Relayer
└── supabase.ts                # Supabase Admin client

contracts/
└── BlockSeal.sol              # 事件型智能合約（最小化 Gas）
```

## 智能合約

```solidity
event Sealed(
    bytes32 indexed id,
    bytes32 ciphertextHash,
    address indexed sender,
    uint256 timestamp
);

function seal(bytes32 id, bytes32 ciphertextHash) external {
    emit Sealed(id, ciphertextHash, msg.sender, block.timestamp);
}
```

合約設計為純事件記錄，不儲存任何狀態，Gas 消耗約 21,000–25,000。

## License

[MIT](./LICENSE)
