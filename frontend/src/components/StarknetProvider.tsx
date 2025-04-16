import React, { useMemo } from 'react'
import {
  argent,
  braavos,
  publicProvider,
  StarknetConfig,
  useInjectedConnectors,
  voyager,
} from '@starknet-react/core'
import { mainnet, sepolia } from '@starknet-react/chains'

export const StarknetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'random',
  })

  const connectors = useMemo(() => injected, [injected])

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={connectors}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}
