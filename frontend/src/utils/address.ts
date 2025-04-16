import { validateAndParseAddress } from 'starknet'

export function shortenL2Address(address: string, chars = 4): string {
  try {
    const parsed = validateAndParseAddress(address)
    return `${parsed.slice(0, chars + 2)}...${parsed.slice(-chars)}`
  } catch (err) {
    throw new Error(`Invalid Starknet address: "${address}". ${err instanceof Error ? err.message : ''}`)
  }
}

export function isValidL2Address(address: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(address)
}
