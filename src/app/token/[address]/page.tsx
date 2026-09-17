import { getPoolTrades, updateTokenInfo } from "@/lib/geckoterminal";
import { UpdateProfileButton } from "@/components/UpdateProfileButton";
import type { Trade } from "@/lib/types";
import { TokenSocials } from "@/components/TokenSocials";
import { SwapBox } from "@/components/SwapBox";

function fmtUsd(n: number | null) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

function Pct({ n }: { n: number | null }) {
  if (n == null) return <span className="text-[#848e9c]">—</span>;
  return (
    <span className={n >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}>
      {n.toFixed(2)}%
    </span>
  );
}

function BarRow({
  label,
  value,
  leftLabel,
  rightLabel,
  left,
  right,
}: {
  label: string;
  value: string;
  leftLabel: string;
  rightLabel: string;
  left: number | null;
  right: number | null;
}) {
  const l = left || 0;
  const r = right || 0;
  const total = l + r || 1;
  return (
    <div className="mb-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] text-[#848e9c]">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
        <div className="text-right text-[11px]">
          <p>
            <span className="text-[#848e9c]">{leftLabel} </span>
            <span className="text-[#0ecb81]">{l.toLocaleString()}</span>
          </p>
          <p>
            <span className="text-[#848e9c]">{rightLabel} </span>
            <span className="text-[#f6465d]">{r.toLocaleString()}</span>
          </p>
        </div>
      </div>
      <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-[#1e2329]">
        <div className="bg-[#0ecb81]" style={{ width: `${(l / total) * 100}%` }} />
        <div className="bg-[#f6465d]" style={{ width: `${(r / total) * 100}%` }} />
      </div>
    </div>
  );
}

export default async function TokenPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  let token = null;
  let error = "";
  let trades: Trade[] = [];

  try {
    token = await updateTokenInfo(address);
    if (token.poolAddress) trades = await getPoolTrades(token.poolAddress);
  } catch (e: any) {
    error = e.message;
  }

  const chartSrc = token?.poolAddress
    ? `https://www.geckoterminal.com/robinhood/pools/${token.poolAddress}?embed=1&info=0&swaps=1&theme=dark`
    : "";

  return (
    <main className="min-h-screen bg-[#0b0e11] text-[#eaecef]">
      <header className="border-b border-[#1e2329] px-4 py-3">
        <a href="/" className="text-xs text-[#848e9c] hover:text-white">
          ← Geckohood
        </a>
      </header>

      {error && <p className="p-4 text-red-400">{error}</p>}

      {token && (
        <section className="grid gap-4 p-3 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            {chartSrc ? (
              <iframe
                title="chart"
                src={chartSrc}
                className="h-[70vh] min-h-[520px] w-full rounded-lg border border-[#1e2329]"
              />
            ) : (
              <div className="flex h-[520px] items-center justify-center rounded-lg border border-[#1e2329] text-sm text-[#848e9c]">
                Chart unavailable
              </div>
            )}

            <div className="mt-3 overflow-hidden rounded-lg border border-[#1e2329]">
              <div className="border-b border-[#1e2329] px-3 py-2 text-xs text-[#848e9c]">
                Transactions
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#848e9c]">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">USD</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Age</th>
                    <th className="px-3 py-2">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((tr) => (
                    <tr key={tr.tx} className="border-t border-[#1e2329]">
                      <td
                        className={`px-3 py-2 ${
                          tr.kind === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"
                        }`}
                      >
                        {tr.kind}
                      </td>
                      <td className="px-3 py-2">
                        {tr.usd != null ? `$${tr.usd.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {tr.price != null ? `$${tr.price.toFixed(6)}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-[#848e9c]">
                        {tr.at ? new Date(tr.at).toLocaleTimeString() : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {tr.tx ? (
                          <a
                            className="text-[#1e90ff]"
                            href={`https://robinhoodchain.blockscout.com/tx/${tr.tx}`}
                            target="_blank"
                          >
                            {tr.tx.slice(0, 8)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-[#1e2329] bg-[#12161c]">
              <div className="h-24 bg-[#1e2329]" />
              <div className="-mt-8 px-4 pb-4">
                {token.imageUrl ? (
                  <img
                    src={token.imageUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full border-2 border-[#12161c] object-cover"
                    style={{ width: 56, height: 56 }}
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0b0e11] text-sm">
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <h1 className="mt-3 text-lg font-semibold">
                  {token.symbol}{" "}
                  <span className="text-sm text-[#848e9c]">
                    / {token.poolName?.split(" / ")[1] ?? "RH"}
                  </span>
                </h1>
                <p className="text-xs text-[#848e9c]">{token.name}</p>
                <p className="mt-2 font-mono text-xl">{fmtUsd(token.priceUsd)}</p>
              </div>
            </div>

                            <TokenSocials address={address} />

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-[#0b0e11] p-3">
                    <p className="text-[11px] text-[#848e9c]">PRICE USD</p>
                    <p className="font-semibold">{fmtUsd(token.priceUsd)}</p>
                  </div>
                  <div className="rounded-lg bg-[#0b0e11] p-3">
                    <p className="text-[11px] text-[#848e9c]">PRICE</p>
                    <p className="font-semibold">{fmtUsd(token.priceUsd)}</p>
                  </div>
                  <div className="rounded-lg bg-[#0b0e11] p-3">
                    <p className="text-[11px] text-[#848e9c]">LIQUIDITY</p>
                    <p className="font-semibold">{fmtUsd(token.liquidityUsd)}</p>
                  </div>
                  <div className="rounded-lg bg-[#0b0e11] p-3">
                    <p className="text-[11px] text-[#848e9c]">FDV</p>
                    <p className="font-semibold">{fmtUsd(token.fdv)}</p>
                  </div>
                  <div className="col-span-2 rounded-lg bg-[#0b0e11] p-3">
                    <p className="text-[11px] text-[#848e9c]">MKT CAP</p>
                    <p className="font-semibold">{fmtUsd(token.fdv)}</p>
                  </div>
                </div>

            <div className="rounded-lg border border-[#1e2329] bg-[#12161c] p-3 text-sm">
              <div className="mb-3 grid grid-cols-4 overflow-hidden rounded-md border border-[#1e2329] text-center text-xs">
                <div className="p-2">
                  <p className="text-[#848e9c]">5M</p>
                  <Pct n={token.priceChange5m} />
                </div>
                <div className="p-2">
                  <p className="text-[#848e9c]">1H</p>
                  <Pct n={token.priceChange1h} />
                </div>
                <div className="p-2">
                  <p className="text-[#848e9c]">6H</p>
                  <Pct n={token.priceChange6h} />
                </div>
                <div className="bg-[#1e2329] p-2">
                  <p className="text-[#848e9c]">24H</p>
                  <Pct n={token.priceChange24h} />
                </div>
              </div>

              <BarRow
                label="TXNS"
                value={token.txns24h?.toLocaleString() ?? "—"}
                leftLabel="BUYS"
                rightLabel="SELLS"
                left={token.buys24h}
                right={token.sells24h}
              />
              <BarRow
                label="VOLUME"
                value={fmtUsd(token.volume24h)}
                leftLabel="BUY VOL"
                rightLabel="SELL VOL"
                left={token.buys24h}
                right={token.sells24h}
              />
              <BarRow
                label="TRADERS"
                value={
                  token.buyers24h != null || token.sellers24h != null
                    ? (
                        (token.buyers24h || 0) + (token.sellers24h || 0)
                      ).toLocaleString()
                    : "—"
                }
                leftLabel="BUYERS"
                rightLabel="SELLERS"
                left={token.buyers24h}
                right={token.sellers24h}
              />
            </div>

            <p className="break-all text-[11px] text-[#5e6673]">{token.address}</p>

            {token.address.startsWith("0x") && (
              <SwapBox token={token.address as `0x${string}`} />
            )}
            <div className="rounded-lg border border-[#1e2329] bg-[#12161c] p-4">
              <h2 className="text-sm font-medium">Update token info</h2>
              <p className="mb-3 text-[11px] text-[#848e9c]">
                Logo, banner and socials. $49.99 USDG.
              </p>
              <UpdateProfileButton address={address} />
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}