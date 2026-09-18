import { getPoolTrades, updateTokenInfo } from "@/lib/geckoterminal";
import { TokenView } from "@/components/TokenView";

export default async function TokenPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  let token = null;
  let error = "";
  let trades: Awaited<ReturnType<typeof getPoolTrades>> = [];

  try {
    token = await updateTokenInfo(address);
    if (token.poolAddress) trades = await getPoolTrades(token.poolAddress);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <main className="min-h-screen bg-[#0b0e11] text-[#eaecef]">
      <header className="border-b border-[#1e2329] px-4 py-3">
        <a href="/" className="text-xs text-[#848e9c]">
          ← Geckohood
        </a>
      </header>
      {error && <p className="p-4 text-red-400">{error}</p>}
      {token && <TokenView token={token} trades={trades} />}
    </main>
  );
}