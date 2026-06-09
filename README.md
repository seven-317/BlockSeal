# BlockSeal

End-to-end encrypted messaging with on-chain integrity proof. Messages are sealed with AES-256-GCM entirely in the browser — the server never sees plaintext. A SHA-256 hash of the ciphertext is written to Ethereum Sepolia as a tamper-proof record.

**[中文說明 → README.zh-TW.md](./README.zh-TW.md)**

## Features

- **Browser-side encryption** — AES-256-GCM via Web Crypto API. The key never leaves the browser.
- **On-chain integrity proof** — Ciphertext hash sealed in a Solidity smart contract on Ethereum Sepolia. Verifiable by anyone on Etherscan.
- **Relayer model** — A server-side wallet pays gas. Users need no wallet, no ETH.
- **Read-once self-destruct** — Ciphertext is deleted from storage immediately after the first open.
- **Password protection** — Optional PBKDF2 (200,000 iterations) key-wrapping. Recipients must enter a password to unlock.
- **QR Code sharing** — Scannable QR code generated from the share URL. The decryption key lives in the URL fragment and is never sent to the server.

## Architecture

```
Browser (encrypt) ──→ API Route (Supabase upload) ──→ Relayer (on-chain seal)
                                                              │
Recipient browser (decrypt) ←── API Route (fetch) ←──────────┘
```

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router · React 19 · TypeScript |
| Styling | Tailwind CSS v4 · CSS custom properties design system |
| Crypto | Web Crypto API (AES-256-GCM · PBKDF2) |
| Chain | viem · Ethereum Sepolia |
| Storage | Supabase (PostgreSQL + Storage) |
| Contract | Solidity 0.8.24 |

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- An Ethereum Sepolia wallet with a small amount of test ETH

### Install

```bash
git clone https://github.com/seven-317/BlockSeal.git
cd BlockSeal
npm install
```

### Environment Variables

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
RELAYER_PRIVATE_KEY=0x...     # Server wallet that pays gas
DEPLOYER_PRIVATE_KEY=0x...    # Wallet used to deploy the contract
CONTRACT_ADDRESS=0x...        # Filled in after deployment
```

> Get Sepolia test ETH at [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de)

### Database Setup

Run `supabase/migrations/001_init.sql` in the Supabase Dashboard → SQL Editor.

Then create a **private** Storage bucket named `ciphertexts` in Supabase → Storage.

### Deploy the Smart Contract

```bash
node scripts/deploy-simple.mjs
```

Copy the printed `CONTRACT_ADDRESS=0x...` into `.env.local`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Security Design

### The key never reaches the server

```
Share URL structure:
https://example.com/v/{id}#{k=<AES key>&iv=<IV>}
                         ↑
               URL fragment — never sent to the server
```

### Password protection flow

```
Password + random salt
      ↓ PBKDF2 (200,000 iterations)
  wrapping key
      ↓ AES-GCM wrap
  encrypted AES key  ──→ stored in URL fragment (alongside salt & kiv)
```

### Full data flow

1. User types plaintext → browser generates AES-256 key + IV
2. Encrypt plaintext → compute SHA-256 hash of ciphertext
3. Upload ciphertext to Supabase Storage; relayer writes hash to the on-chain contract
4. Share URL = `/v/{id}#{key&IV}` (key in fragment, invisible to server)
5. Recipient opens URL → downloads ciphertext → decrypts in browser → verifies hash matches on-chain record
6. `consume` API call → ciphertext deleted from Storage, record marked as opened

## Project Structure

```
app/
├── api/
│   ├── seal/route.ts              # Receive ciphertext, seal on-chain, write to DB
│   └── open/[id]/
│       ├── route.ts               # Fetch ciphertext (with guards)
│       └── consume/route.ts       # Mark as opened, delete ciphertext
├── v/[id]/page.tsx                # Share link decrypt page
└── page.tsx                       # Main page

components/
├── compose/                       # Message editor, encryption flow
├── result/                        # Result screen, QR code, chain info
└── decrypt/                       # Decrypt flow, password input

lib/
├── crypto.ts                      # Web Crypto API wrapper
├── chain.ts                       # viem relayer
└── supabase.ts                    # Supabase admin client

contracts/
└── BlockSeal.sol                  # Event-only contract (minimal gas)
```

## Smart Contract

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

Event-only design: no state storage, ~21,000–25,000 gas per seal.

## License

[MIT](./LICENSE)
