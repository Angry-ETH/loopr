import { useContractRead, useContractWrite } from '@starknet-react/core'
import { Abi, Call } from 'starknet'

export function useStarknetRead<T = any>({
  contract,
  abi,
  functionName,
  args = [],
  watch = false,
}: {
  contract: string
  abi: Abi
  functionName: string
  args?: any[]
  watch?: boolean
}) {
  const { data, isLoading, error, refetch } = useContractRead({
    address: contract,
    abi,
    functionName,
    args,
    watch,
  })

  return {
    data: data as T,
    isLoading,
    error,
    refetch,
  }
}

export function useStarknetWrite({
  calls,
}: {
  calls: Call[]
}) {
  const { writeAsync, isPending, error } = useContractWrite({ calls })

  return {
    write: writeAsync,
    isPending,
    error,
  }
}
