"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { robinhoodChain } from "@/lib/chain";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

const config = getDefaultConfig({
  appName: "Geckohood",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "geckohood-local",
  chains: [robinhoodChain],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} initialChain={robinhoodChain}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}