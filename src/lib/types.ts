export type TokenInfo = {
  address: string;
  name: string;
  symbol: string;
  priceUsd: number | null;
  priceChange5m: number | null;
  priceChange1h: number | null;
  priceChange6h: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  fdv: number | null;
  txns24h: number | null;
  buys24h: number | null;
  sells24h: number | null;
  buyers24h: number | null;
  sellers24h: number | null;
  createdAt: string | null;
  poolAddress: string | null;
  poolName: string | null;
  imageUrl: string | null;
  updatedAt: string;
};

export type Trade = {
  kind: string;
  usd: number | null;
  price: number | null;
  at: string;
  tx: string;
};