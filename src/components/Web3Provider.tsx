'use client';

import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const wagmiConfig = getDefaultConfig({
  appName: 'DSRM Network // Orbital Exchange',
  projectId: 'c4f79cc821944d9680842e34466bfbd4',
  chains: [sepolia],
  transports: {
    [sepolia.id]: fallback([
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://1rpc.io/sepolia'),
      http('https://rpc.sepolia.org'),
    ]),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#2563EB',
            accentColorForeground: '#FFFFFF',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
