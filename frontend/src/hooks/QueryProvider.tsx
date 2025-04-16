import React from 'react'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'

const defaultQueryClient = new QueryClient()

interface QueryProviderProps {
  queryClient?: QueryClient
}

export function QueryProvider({ queryClient, children }: React.PropsWithChildren<QueryProviderProps>) {
  const existingQueryClient = useQueryClient()

  if (existingQueryClient) {
    return children
  }

  return <QueryClientProvider client={queryClient ?? defaultQueryClient}>{children}</QueryClientProvider>
}
