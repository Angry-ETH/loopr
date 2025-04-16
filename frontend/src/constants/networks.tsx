import { Chain, mainnet, goerli } from '@starknet-react/chains'
import { ChainProviderFactory } from '@starknet-react/core'
import { RpcProvider } from 'starknet'

export const dev: Chain = {
  id: 1337n,
  name: 'Starknet Devnet',
  network: 'dev',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
  },
  rpcUrls: {
    default: { http: ['http://localhost:5050'] },
    public: {
      http: [],
      websocket: undefined
    }
  },
  testnet: true,
}

export const SUPPORTED_STARKNET_NETWORKS = [mainnet, goerli]

const NETHERMIND_KEY = process.env.REACT_APP_NETHERMIND_KEY as string | undefined
if (!NETHERMIND_KEY) {
  throw new Error(
    '[config] Environment variable REACT_APP_NETHERMIND_KEY is required but not defined.'
  )
}

const DEFAULT_NETWORK_NAME = process.env.REACT_APP_DEFAULT_NETWORK_NAME as string | undefined
if (!DEFAULT_NETWORK_NAME) {
  throw new Error(
    '[config] Environment variable REACT_APP_DEFAULT_NETWORK_NAME is required but not defined.'
  )
}

const isValidDefaultNetwork = SUPPORTED_STARKNET_NETWORKS.some(
  (chain) => chain.network === DEFAULT_NETWORK_NAME
)

if (!isValidDefaultNetwork) {
  const validNames = SUPPORTED_STARKNET_NETWORKS.map((c) => c.network).join(', ')
  throw new Error(
    `[config] Invalid REACT_APP_DEFAULT_NETWORK_NAME: "${DEFAULT_NETWORK_NAME}". Expected one of: ${validNames}.`
  )
}

export const nethermindRpcProviders: ChainProviderFactory = (chain: Chain) => {
  const baseUrl = 'https://rpc.nethermind.io'

  switch (chain.id) {
    case goerli.id:
      return new RpcProvider({ nodeUrl: `${baseUrl}/goerli-juno/?apikey=${NETHERMIND_KEY}` })

    case mainnet.id:
      return new RpcProvider({ nodeUrl: `${baseUrl}/mainnet-juno/?apikey=${NETHERMIND_KEY}` })

    default:
      console.warn(`[rpc] Unsupported chain ID: ${chain.id}`)
      return null
  }
}
