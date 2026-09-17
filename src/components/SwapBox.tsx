"use client";

import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { erc20Abi, parseEther, formatEther } from "viem";
import { useMemo, useState } from "react";
import { routerAbi, V2_ROUTER, WETH } from "@/lib/swap";

export function SwapBox({ token }: { token: `0x${string}` }) {
  const { address, isConnected } = useAccount();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.01");
  const [status, setStatus] = useState("");
  const { writeContractAsync, isPending } = useWriteContract();

  const zero = BigInt(0);

  const amountIn = useMemo(() => {
    try {
      return parseEther(amount || "0");
    } catch {
      return zero;
    }
  }, [amount]);

  const path = side === "buy" ? [WETH, token] : [token, WETH];

  const { data: amounts } = useReadContract({
    address: V2_ROUTER,
    abi: routerAbi,
    functionName: "getAmountsOut",
    args: amountIn > zero ? [amountIn, path] : undefined,
    query: { enabled: amountIn > zero },
  });

  const out = amounts?.[1] ?? zero;
  const minOut = (out * BigInt(90)) / BigInt(100);

  async function swap() {
    if (!address || amountIn === zero) return;
    try {
      setStatus("Confirm in wallet...");
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      if (side === "buy") {
        const hash = await writeContractAsync({
          address: V2_ROUTER,
          abi: routerAbi,
          functionName: "swapExactETHForTokens",
          args: [minOut, path, address, deadline],
          value: amountIn,
          chainId: 4663,
        });
        setStatus(`Buy sent: ${hash}`);
        return;
      }

      setStatus("Approve token...");
      await writeContractAsync({
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [V2_ROUTER, amountIn],
        chainId: 4663,
      });

      setStatus("Confirm sell...");
      const hash = await writeContractAsync({
        address: V2_ROUTER,
        abi: routerAbi,
        functionName: "swapExactTokensForETH",
        args: [amountIn, minOut, path, address, deadline],
        chainId: 4663,
      });
      setStatus(`Sell sent: ${hash}`);
    } catch (e: any) {
      setStatus(e.shortMessage || e.message || "Swap failed");
    }
  }

  return (
    <div className="rounded-lg border border-[#1e2329] bg-[#12161c] p-4">
      <p className="mb-3 text-sm font-medium">Trade · 0% fee</p>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 rounded-md py-2 text-sm ${
            side === "buy" ? "bg-[#0ecb81] text-black" : "bg-[#0b0e11] text-[#848e9c]"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 rounded-md py-2 text-sm ${
            side === "sell" ? "bg-[#f6465d] text-white" : "bg-[#0b0e11] text-[#848e9c]"
          }`}
        >
          Sell
        </button>
      </div>

      <label className="text-[11px] text-[#848e9c]">
        {side === "buy" ? "You pay (ETH)" : "You sell (tokens)"}
      </label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-2 mt-1 w-full rounded-md bg-[#0b0e11] px-3 py-2 text-sm"
      />
      <p className="mb-3 text-xs text-[#848e9c]">
        Est. out: {out > zero ? formatEther(out) : "—"}{" "}
        {side === "buy" ? "tokens" : "ETH"}
      </p>

      {!isConnected ? (
        <ConnectButton />
      ) : (
        <button
          onClick={swap}
          disabled={isPending || amountIn === zero}
          className="w-full rounded-md bg-[#1e90ff] py-2 text-sm disabled:opacity-50"
        >
          {isPending ? "Swapping..." : side === "buy" ? "Buy" : "Sell"}
        </button>
      )}
      {status && (
        <p className="mt-2 break-all text-[11px] text-[#848e9c]">{status}</p>
      )}
    </div>
  );
}