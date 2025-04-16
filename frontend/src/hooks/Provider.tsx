import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import { ProviderInterface } from 'starknet'

import { QueryProvider } from './QueryProvider'

export interface ProviderProps {
  provider?: ProviderInterface
  queryClient?: QueryClient
}

export function Provider({ queryClient, children }: React.PropsWithChildren<ProviderProps>) {
  return (
    <QueryProvider queryClient={queryClient}>{children}</QueryProvider>
  )
}
