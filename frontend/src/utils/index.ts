export const parseBigInt = (value: string | bigint): bigint | null => {
    try {
      const integerPart = value.toString().split(".")[0];
      return BigInt(integerPart);
    } catch {
      return null;
    }
  };