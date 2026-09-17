export const PROFILE_FEE_USD = 49.99;
export const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168" as const;
export const TREASURY = (process.env.NEXT_PUBLIC_TREASURY ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const FEE_UNITS = BigInt("49990000");