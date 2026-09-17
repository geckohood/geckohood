import type { TokenInfo, Trade } from "./types";

const GT = "https://api.geckoterminal.com/api/v2";
const NETWORK = "robinhood";
const cache = new Map<string, { at: number; data: any }>();

async function gtFetch(path: string) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < 30_000) return hit.data;

  const res = await fetch(`${GT}${path}`, {
    headers: { Accept: "application/json;version=20230203" },
    next: { revalidate: 30 },
  });

  if (res.status === 429) {
    if (hit) return hit.data;
    throw new Error("GeckoTerminal rate limit. Espera 30–60 segundos y recarga.");
  }
  if (!res.ok) throw new Error(`GeckoTerminal error ${res.status}`);

  const data = await res.json();
  cache.set(path, { at: Date.now(), data });
  return data;
}

export async function getTrendingPools(duration = "24h") {
  return gtFetch(
    `/networks/${NETWORK}/trending_pools?page=1&duration=${duration}&include=base_token,quote_token`
  );
}

export async function getNewPools() {
  return gtFetch(
    `/networks/${NETWORK}/new_pools?page=1&include=base_token,quote_token`
  );
}

function num(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function mapPoolToToken(pool: any, included: any[] = []): TokenInfo {
  const attr = pool.attributes ?? {};
  const pct = attr.price_change_percentage ?? {};
  const tx = attr.transactions?.h24 ?? {};
  const baseToken = pool.relationships?.base_token?.data?.id ?? "";
  const tokenAddress = baseToken.includes("_")
    ? baseToken.split("_")[1]
    : attr.address ?? "";

  const tokenMeta = included.find(
    (x) =>
      x.type === "token" &&
      (x.id === baseToken || x.attributes?.address === tokenAddress)
  );

  const imageUrl =
    tokenMeta?.attributes?.image_url ||
    (tokenAddress
      ? `https://dd.dexscreener.com/ds-data/tokens/robinhood/${tokenAddress}.png`
      : null);

  return {
    address: tokenAddress.toLowerCase(),
    name: tokenMeta?.attributes?.name ?? attr.name ?? "Unknown",
    symbol:
      tokenMeta?.attributes?.symbol ?? attr.name?.split(" / ")[0] ?? "???",
    priceUsd: num(attr.base_token_price_usd),
    priceChange5m: num(pct.m5),
    priceChange1h: num(pct.h1),
    priceChange6h: num(pct.h6),
    priceChange24h: num(pct.h24),
    volume24h: num(attr.volume_usd?.h24),
    liquidityUsd: num(attr.reserve_in_usd),
    fdv: num(attr.fdv_usd) ?? num(attr.market_cap_usd),
    txns24h:
      tx.buys != null || tx.sells != null
        ? Number(tx.buys || 0) + Number(tx.sells || 0)
        : null,
    buys24h: tx.buys != null ? Number(tx.buys) : null,
    sells24h: tx.sells != null ? Number(tx.sells) : null,
    buyers24h: tx.buyers != null ? Number(tx.buyers) : null,
    sellers24h: tx.sellers != null ? Number(tx.sellers) : null,
    createdAt: attr.pool_created_at ?? null,
    poolAddress: attr.address ?? null,
    poolName: attr.name ?? null,
    imageUrl,
    updatedAt: new Date().toISOString(),
  };
}

export async function updateTokenInfo(address: string): Promise<TokenInfo> {
  const tokenAddr = address.toLowerCase();
  const json = await gtFetch(
    `/networks/${NETWORK}/tokens/${tokenAddr}?include=top_pools`
  );

  const attr = json.data?.attributes ?? {};
  const pool = json.included?.find((x: any) => x.type === "pool");
  const poolAttr = pool?.attributes ?? {};
  const pct = attr.price_change_percentage ?? poolAttr.price_change_percentage ?? {};
  const tx = poolAttr.transactions?.h24 ?? {};

  return {
    address: tokenAddr,
    name: attr.name ?? "Unknown",
    symbol: attr.symbol ?? "???",
    priceUsd: num(attr.price_usd),
    priceChange5m: num(pct.m5),
    priceChange1h: num(pct.h1),
    priceChange6h: num(pct.h6),
    priceChange24h: num(pct.h24),
    volume24h: num(poolAttr.volume_usd?.h24) ?? num(attr.volume_usd?.h24),
    liquidityUsd: num(poolAttr.reserve_in_usd),
    fdv: num(attr.fdv_usd) ?? num(attr.market_cap_usd),
    txns24h:
      tx.buys != null || tx.sells != null
        ? Number(tx.buys || 0) + Number(tx.sells || 0)
        : null,
    buys24h: tx.buys != null ? Number(tx.buys) : null,
    sells24h: tx.sells != null ? Number(tx.sells) : null,
    buyers24h: tx.buyers != null ? Number(tx.buyers) : null,
    sellers24h: tx.sellers != null ? Number(tx.sellers) : null,
    createdAt: poolAttr.pool_created_at ?? null,
    poolAddress: pool?.id?.split("_")?.[1] ?? poolAttr.address ?? null,
    poolName: poolAttr.name ?? null,
    imageUrl: attr.image_url ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getPoolTrades(poolAddress: string): Promise<Trade[]> {
  if (!poolAddress) return [];
  const json = await gtFetch(
    `/networks/${NETWORK}/pools/${poolAddress}/trades?trade_volume_in_usd_greater_than=1`
  );
  return (json.data ?? []).slice(0, 20).map((t: any) => {
    const a = t.attributes ?? {};
    return {
      kind: a.kind ?? "unknown",
      usd: a.volume_in_usd ? Number(a.volume_in_usd) : null,
      price: a.price_to_in_usd ? Number(a.price_to_in_usd) : null,
      at: a.block_timestamp ?? "",
      tx: a.tx_hash ?? "",
    };
  });
}