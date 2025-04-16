import React, { useMemo } from 'react'
import {
  argent,
  braavos,
  StarknetConfig,
  starkscan,
  useInjectedConnectors,
  useNetwork,
} from '@starknet-react/core'
import { QueryClient } from '@tanstack/react-query'

import { ArgentMobileConnector } from 'starknetkit/argentMobile'
import { WebWalletConnector } from 'starknetkit/webwallet'

import { nethermindRpcProviders, SUPPORTED_STARKNET_NETWORKS } from 'src/constants/networks'
import { Provider as HooksProvider } from '../../hooks/Provider'

const queryClient = new QueryClient()

export function StarknetProvider({ children }: React.PropsWithChildren) {
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'always',
  })

  const connectors = useMemo(
    () => [
      ...injected,
      new WebWalletConnector({ url: 'https://web.argent.xyz' }),
      new ArgentMobileConnector(),
    ],
    [injected]
  )

  return (
    <StarknetConfig
      queryClient={queryClient}
      connectors={connectors}
      chains={SUPPORTED_STARKNET_NETWORKS}
      provider={nethermindRpcProviders}
      explorer={starkscan}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}

export function HooksSDKProvider({ children }: React.PropsWithChildren) {
  const { chain } = useNetwork()

  const provider = useMemo(() => {
    const p = nethermindRpcProviders(chain)
    if (!p) {
      console.warn('[HooksSDKProvider] No provider found for current chain:', chain)
    }
    return p ?? undefined
  }, [chain])

  return (
    <HooksProvider provider={provider} queryClient={queryClient}>
      {children}
    </HooksProvider>
  )
}
