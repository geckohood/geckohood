import { getTrendingPools, mapPoolToToken } from "@/lib/geckoterminal";
import type { TokenInfo } from "@/lib/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  let rows: TokenInfo[] = [];
  let error = "";

  try {
    const data = await getTrendingPools("24h");
    rows = (data.data ?? [])
      .map((pool: any) => mapPoolToToken(pool, data.included ?? []))
      .filter((token: TokenInfo) => {
        if (!query) return true;
        return (
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.address.includes(query) ||
          (token.poolName || "").toLowerCase().includes(query)
        );
      });
  } catch (e: any) {
    error = e.message;
  }

  return (
    <main className="min-h-screen bg-[#0b0e11] p-6 text-[#eaecef]">
      <a href="/" className="text-xs text-[#848e9c]">
        ← Geckohood
      </a>
      <h1 className="mt-4 text-xl">Search</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Token, pair or 0x address"
          className="w-full max-w-md rounded-md border border-[#1e2329] bg-[#12161c] px-3 py-2 text-sm"
        />
      </form>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-6 space-y-2">
        {rows.map((token: TokenInfo) => (
          <a
            key={`${token.address}-${token.poolName}`}
            href={token.address ? `/token/${token.address}` : "#"}
            className="block rounded-md border border-[#1e2329] px-3 py-2 hover:bg-[#12161c]"
          >
            {token.symbol} · {token.poolName}
          </a>
        ))}
        {rows.length === 0 && !error && (
          <p className="text-sm text-[#848e9c]">Sin resultados</p>
        )}
      </div>
    </main>
  );
}