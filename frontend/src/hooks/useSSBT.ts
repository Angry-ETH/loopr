import { useAccount, useBlock } from '@starknet-react/core'
import { SSBT_CONTRACT_ADDRESS } from 'src/constants/ssbt'
import { ABI as SSBT_ABI } from 'src/constants/abi/ssbt'
import { parseBigInt } from 'src/utils'
import { useStarknetRead, useStarknetWrite } from './useStarknet'
import { useMemo } from 'react'
import { Call } from 'starknet'

export function useSSBTBalance() {
  const { address } = useAccount()

  const { data, isLoading } = useStarknetRead<bigint>({
    contract: SSBT_CONTRACT_ADDRESS,
    abi: SSBT_ABI,
    functionName: 'ssbt_balance_of',
    args: address ? [address] : [],
    watch: true,
  })

  return {
    balance: parseBigInt(data ?? 0) ?? 0n,
    loading: isLoading,
  }
}

export function useERC20Balance() {
  const { address } = useAccount()

  const { data, isLoading } = useStarknetRead<bigint>({
    contract: SSBT_CONTRACT_ADDRESS,
    abi: SSBT_ABI,
    functionName: 'balance_of',
    args: address ? [address] : [],
    watch: true,
  })

  return {
    balance: parseBigInt(data ?? 0) ?? 0n,
    loading: isLoading,
  }
}

export function useLastSublimateTime() {
  const { address } = useAccount()
  const { data, isLoading } = useStarknetRead<bigint>({
    contract: SSBT_CONTRACT_ADDRESS,
    abi: SSBT_ABI,
    functionName: 'get_last_sublimate_time',
    args: address ? [address] : [],
  })
  return {
    data: parseBigInt(data ?? 0n) ?? 0n,
    isLoading,
  }
}

export function useCooldownPeriod() {
  const { data, isLoading } = useStarknetRead<bigint>({
    contract: SSBT_CONTRACT_ADDRESS,
    abi: SSBT_ABI,
    functionName: 'cooldown_period',
  })
  return {
    data: parseBigInt(data ?? 0n) ?? 0n,
    isLoading,
  }
}

export function useSublimate() {
  const calls: Call[] = useMemo(() => [{
    contractAddress: SSBT_CONTRACT_ADDRESS,
    entrypoint: 'sublimate',
    calldata: [],
  }], [])

  return useStarknetWrite({ calls })
}

export function useIsCooldownFinished(): {
  isReady: boolean
  isLoading: boolean
} {
  const { data: block } = useBlock({ refetchInterval: 10000 })

  const { data: lastBlock } = useLastSublimateTime()
  const { data: cooldown } = useCooldownPeriod()

  if (!block?.block_number || !lastBlock || !cooldown) {
    return { isReady: false, isLoading: true }
  }

  const currentBlock = BigInt(block.block_number)
  const passed = currentBlock - lastBlock >= cooldown

  return { isReady: passed, isLoading: false }
}