"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract } from "wagmi";
import { erc20Abi } from "viem";
import { FEE_UNITS, TREASURY, USDG } from "@/lib/pay";
import { useState } from "react";

export function UpdateProfileButton({ address }: { address: string }) {
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    logoUrl: "",
    bannerUrl: "",
    website: "",
    twitter: "",
    telegram: "",
    description: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function payAndSave() {
    try {
      if (TREASURY.startsWith("0x0000")) {
        setStatus("Pon tu wallet en .env.local (NEXT_PUBLIC_TREASURY)");
        return;
      }
      setStatus("Confirm 49.99 USDG in wallet...");
      const hash = await writeContractAsync({
        address: USDG,
        abi: erc20Abi,
        functionName: "transfer",
        args: [TREASURY, FEE_UNITS],
        chainId: 4663,
      });

      const profiles = JSON.parse(
        localStorage.getItem("geckohood-profiles") || "{}"
      );
      profiles[address.toLowerCase()] = {
        ...form,
        txHash: hash,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("geckohood-profiles", JSON.stringify(profiles));
      setStatus(`Paid and saved. Tx: ${hash}`);
    } catch (e: any) {
      setStatus(e.shortMessage || e.message || "Payment failed");
    }
  }

  return (
    <div className="space-y-3">
      <ConnectButton />
      {isConnected && (
        <>
          <input
            className="w-full rounded bg-[#0b0e11] p-2 text-sm"
            placeholder="Logo URL"
            value={form.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
          />
          <input
            className="w-full rounded bg-[#0b0e11] p-2 text-sm"
            placeholder="Banner URL"
            value={form.bannerUrl}
            onChange={(e) => set("bannerUrl", e.target.value)}
          />
          <input
            className="w-full rounded bg-[#0b0e11] p-2 text-sm"
            placeholder="Website"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
          <input
            className="w-full rounded bg-[#0b0e11] p-2 text-sm"
            placeholder="Twitter / X"
            value={form.twitter}
            onChange={(e) => set("twitter", e.target.value)}
          />
          <input
            className="w-full rounded bg-[#0b0e11] p-2 text-sm"
            placeholder="Telegram"
            value={form.telegram}
            onChange={(e) => set("telegram", e.target.value)}
          />
          <textarea
            className="w-full rounded bg-[#0b0e11] p-2 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <button
            onClick={payAndSave}
            disabled={isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm disabled:opacity-50"
          >
            {isPending ? "Paying..." : "Update token info — $49.99"}
          </button>
        </>
      )}
      {status && <p className="break-all text-xs text-[#848e9c]">{status}</p>}
    </div>
  );
}