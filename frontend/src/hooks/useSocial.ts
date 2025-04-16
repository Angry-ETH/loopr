import { useAccount } from '@starknet-react/core'
import { useStarknetRead, useStarknetWrite } from './useStarknet'
import { SSBT_CONTRACT_ADDRESS } from 'src/constants/ssbt'
import { ABI as SSBT_ABI } from 'src/constants/abi/ssbt'
import { parseBigInt } from 'src/utils'
import { Call } from 'starknet'
import { useMemo } from 'react'

export function useFolloweesCount(address?: string) {
  const { data, isLoading } = useStarknetRead<bigint>({
    contract: SSBT_CONTRACT_ADDRESS,
    abi: SSBT_ABI,
    functionName: 'get_followees',
    args: address ? [address] : [],
    watch: true,
  })

  return {
    count: data ? (data as unknown as string[]).length : 0,
    isLoading,
  }
}

export function useIsFollowing(target?: string) {
  const { address } = useAccount()

  const { data, isLoading } = useStarknetRead<bigint>({
    contract: SSBT_CONTRACT_ADDRESS,
    abi: SSBT_ABI,
    functionName: 'get_follow_duration',
    args: address && target ? [address, target] : [],
    watch: true,
  })

  const duration = parseBigInt(data ?? 0n) ?? 0n

  return {
    isFollowing: duration > 0n,
    isLoading,
  }
}

export function useFollow(target?: string) {
  const calls: Call[] = useMemo(() => {
    if (!target) return []
    return [{
      contractAddress: SSBT_CONTRACT_ADDRESS,
      entrypoint: 'follow',
      calldata: [target],
    }]
  }, [target])

  return useStarknetWrite({ calls })
}
