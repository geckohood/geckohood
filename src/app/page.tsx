import { getNewPools, getTrendingPools, mapPoolToToken } from "@/lib/geckoterminal";
import type { TokenInfo } from "@/lib/types";

function fmtUsd(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

function fmtPct(n: number | null) {
  if (n == null) return "—";
  return `${n.toFixed(2)}%`;
}

function age(iso: string | null) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 24) return `${Math.max(h, 0)}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return `${Math.floor(d / 30)}mo`;
}

function Pct({ n }: { n: number | null }) {
  const up = Number(n) >= 0;
  return (
    <span className={n == null ? "text-[#848e9c]" : up ? "text-[#0ecb81]" : "text-[#f6465d]"}>
      {fmtPct(n)}
    </span>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded-full px-3 py-1 text-xs ${
        active ? "bg-[#1e90ff] text-white" : "bg-[#12161c] text-[#848e9c]"
      }`}
    >
      {children}
    </a>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; duration?: string }>;
}) {
  const { tab = "trending", duration = "24h" } = await searchParams;
  let rows: TokenInfo[] = [];
  let error = "";

  try {
    const data =
      tab === "new" ? await getNewPools() : await getTrendingPools(duration);
    rows = (data.data ?? []).map((pool: any) =>
      mapPoolToToken(pool, data.included ?? [])
    );
    if (tab === "gainers") {
      rows = [...rows].sort(
        (a, b) => (b.priceChange24h || -999) - (a.priceChange24h || -999)
      );
    }
  } catch (e: any) {
    error = e.message;
  }

  const vol = rows.reduce((a, t) => a + (t.volume24h || 0), 0);
  const txs = rows.reduce((a, t) => a + (t.txns24h || 0), 0);

  return (
    <main className="flex min-h-screen bg-[#0b0e11] text-[#eaecef]">
      <aside className="hidden w-52 shrink-0 border-r border-[#1e2329] p-4 md:block">
        <p className="mb-6 text-sm font-semibold tracking-wide">GECKOHOOD</p>
        <form action="/search" className="mb-4">
          <input
            name="q"
            placeholder="Search"
            className="w-full rounded-md border border-[#1e2329] bg-[#12161c] px-2 py-1.5 text-xs"
          />
        </form>
        <nav className="space-y-1 text-sm text-[#848e9c]">
          <a
            className={`block rounded-md px-3 py-2 ${tab === "trending" ? "bg-[#12161c] text-white" : ""}`}
            href="/?tab=trending&duration=24h"
          >
            Trending
          </a>
          <a
            className={`block rounded-md px-3 py-2 ${tab === "new" ? "bg-[#12161c] text-white" : ""}`}
            href="/?tab=new"
          >
            New Pairs
          </a>
          <a
            className={`block rounded-md px-3 py-2 ${tab === "gainers" ? "bg-[#12161c] text-white" : ""}`}
            href="/?tab=gainers&duration=24h"
          >
            Gainers
          </a>
        </nav>
        <p className="mt-8 text-[11px] text-[#5e6673]">Robinhood Chain</p>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-2 gap-3 p-3">
          <div className="rounded-lg border border-[#1e2329] bg-[#12161c] px-4 py-3">
            <p className="text-[11px] text-[#848e9c]">24H VOLUME</p>
            <p className="text-lg font-semibold">{fmtUsd(vol)}</p>
          </div>
          <div className="rounded-lg border border-[#1e2329] bg-[#12161c] px-4 py-3">
            <p className="text-[11px] text-[#848e9c]">24H TXNS</p>
            <p className="text-lg font-semibold">{txs.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-3 pb-3">
          <Tab href="/?tab=trending&duration=24h" active={tab === "trending"}>
            Trending
          </Tab>
          <Tab href="/?tab=trending&duration=5m" active={tab === "trending" && duration === "5m"}>
            5M
          </Tab>
          <Tab href="/?tab=trending&duration=1h" active={tab === "trending" && duration === "1h"}>
            1H
          </Tab>
          <Tab href="/?tab=trending&duration=6h" active={tab === "trending" && duration === "6h"}>
            6H
          </Tab>
          <Tab href="/?tab=trending&duration=24h" active={tab === "trending" && duration === "24h"}>
            24H
          </Tab>
          <Tab href="/?tab=gainers&duration=24h" active={tab === "gainers"}>
            Gainers
          </Tab>
          <Tab href="/?tab=new" active={tab === "new"}>
            New Pairs
          </Tab>
        </div>

        {error && <p className="px-3 text-sm text-red-400">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[13px]">
            <thead className="sticky top-0 bg-[#12161c] text-[11px] uppercase tracking-wider text-[#848e9c]">
              <tr>
                <th className="px-3 py-3">Token</th>
                <th className="px-3 py-3">MCAP</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Age</th>
                <th className="px-3 py-3">Txns</th>
                <th className="px-3 py-3">Volume</th>
                <th className="px-3 py-3">5M</th>
                <th className="px-3 py-3">1H</th>
                <th className="px-3 py-3">6H</th>
                <th className="px-3 py-3">24H</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr
                  key={t.poolAddress ?? t.name + i}
                  className="h-14 border-t border-[#1e2329] hover:bg-[#12161c]"
                >
                  <td className="px-3 py-2">
                    <a
                      href={t.address ? `/token/${t.address}` : "#"}
                      className="flex items-center gap-3"
                    >
                      <span className="w-5 shrink-0 text-[#848e9c]">#{i + 1}</span>
                      <span className="block h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#12161c]">
                        {t.imageUrl ? (
                          <img
                            src={t.imageUrl}
                            alt=""
                            width={28}
                            height={28}
                            className="h-7 w-7 object-cover"
                            style={{ width: 28, height: 28 }}
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center text-[10px]">
                            {t.symbol.slice(0, 2)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="font-medium text-[#f0b90b]">{t.symbol}</span>
                        <span className="text-[#848e9c]">
                          {" "}
                          / {t.poolName?.split(" / ")[1] ?? "RH"}
                        </span>
                        <p className="truncate text-[11px] text-[#848e9c]">{t.name}</p>
                      </span>
                    </a>
                  </td>
                  <td className="px-3 py-2">{fmtUsd(t.fdv)}</td>
                  <td className="px-3 py-2 font-mono">{fmtUsd(t.priceUsd)}</td>
                  <td className="px-3 py-2 text-[#848e9c]">{age(t.createdAt)}</td>
                  <td className="px-3 py-2">{t.txns24h?.toLocaleString() ?? "—"}</td>
                  <td className="px-3 py-2">{fmtUsd(t.volume24h)}</td>
                  <td className="px-3 py-2">
                    <Pct n={t.priceChange5m} />
                  </td>
                  <td className="px-3 py-2">
                    <Pct n={t.priceChange1h} />
                  </td>
                  <td className="px-3 py-2">
                    <Pct n={t.priceChange6h} />
                  </td>
                  <td className="px-3 py-2">
                    <Pct n={t.priceChange24h} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}