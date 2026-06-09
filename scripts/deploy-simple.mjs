import { createWalletClient, createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
    .map(([k, ...v]) => [k, v.join('=')])
)

const privateKey = env.DEPLOYER_PRIVATE_KEY
const rpcUrl = env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'

if (!privateKey) {
  console.error('Missing DEPLOYER_PRIVATE_KEY in .env.local')
  process.exit(1)
}

const BYTECODE = '0x6080604052348015600e575f5ffd5b506101978061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610029575f3560e01c8063e6b0d6e51461002d575b5f5ffd5b610047600480360381019061004291906100d5565b610049565b005b3373ffffffffffffffffffffffffffffffffffffffff16827fd03696c87a0939e69c84235161b9f2fcb608cc020188aaeca980aec3fd2fc971834260405161009292919061013a565b60405180910390a35050565b5f5ffd5b5f819050919050565b6100b4816100a2565b81146100be575f5ffd5b50565b5f813590506100cf816100ab565b92915050565b5f5f604083850312156100eb576100ea61009e565b5b5f6100f8858286016100c1565b9250506020610109858286016100c1565b9150509250929050565b61011c816100a2565b82525050565b5f819050919050565b61013481610122565b82525050565b5f60408201905061014d5f830185610113565b61015a602083018461012b565b939250505056fea2646970667358221220c68e3eea25dc66a520e695e4fa5119f896cbade86c874ea450a91f10855952d964736f6c63430008220033'

const key = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
const account = privateKeyToAccount(key)

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
})

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
})

console.log(`Deploying from: ${account.address}`)
console.log(`RPC: ${rpcUrl}`)

const balance = await publicClient.getBalance({ address: account.address })
console.log(`Balance: ${Number(balance) / 1e18} ETH`)

if (balance === 0n) {
  console.error('No ETH balance — get Sepolia ETH from https://sepolia-faucet.pk910.de first')
  process.exit(1)
}

console.log('Sending deployment transaction...')
const hash = await walletClient.deployContract({
  abi: [],
  bytecode: BYTECODE,
})

console.log(`Tx hash: ${hash}`)
console.log('Waiting for confirmation...')

const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log(`\n✅ Contract deployed!`)
console.log(`CONTRACT_ADDRESS=${receipt.contractAddress}`)
console.log(`\nAdd this to your .env.local`)
