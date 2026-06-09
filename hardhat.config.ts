import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    sepolia: {
      type: 'http',
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
}

export default config
