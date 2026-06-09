// Server-only: never import this from client components
import { createWalletClient, http, parseAbiItem } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const SEAL_ABI = [
  parseAbiItem('function seal(bytes32 id, bytes32 ciphertextHash) external'),
]

function getClients() {
  const account = privateKeyToAccount(
    process.env.RELAYER_PRIVATE_KEY as `0x${string}`,
  )
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  })
  return { walletClient, account }
}

export async function sealOnChain(id: string, cipherHash: string): Promise<string> {
  const { walletClient } = getClients()

  // Pad id (UUID hex without dashes) and hash to bytes32
  const idBytes = `0x${id.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`
  const hashBytes = `0x${cipherHash}` as `0x${string}`

  const txHash = await walletClient.writeContract({
    address: process.env.CONTRACT_ADDRESS as `0x${string}`,
    abi: SEAL_ABI,
    functionName: 'seal',
    args: [idBytes, hashBytes],
  })

  return txHash
}
