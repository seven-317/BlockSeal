import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying with:', deployer.address)

  const factory = await ethers.getContractFactory('BlockSeal')
  const contract = await factory.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('BlockSeal deployed to:', address)
  console.log('')
  console.log('Add to .env.local:')
  console.log(`CONTRACT_ADDRESS=${address}`)
}

main().catch(e => { console.error(e); process.exit(1) })
