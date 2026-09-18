'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useConnect } from 'wagmi';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { MetaMaskLogo, EthereumMonochrome } from './Web3Icons';

export function WalletButton() {
  const { connectAsync, connectors } = useConnect();

  const handleDirectConnect = async (fallbackModal?: () => void) => {
    try {
      if (typeof window !== 'undefined' && (window as unknown as { ethereum?: unknown }).ethereum) {
        const injectedConn = connectors.find(
          (c) => c.id === 'injected' || c.id === 'metaMaskSDK' || c.id === 'metaMask' || c.id === 'io.metamask'
        ) || connectors[0];

        if (injectedConn) {
          await connectAsync({ connector: injectedConn });
          return;
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { name?: string; code?: number };
      if (errorObj?.name === 'UserRejectedRequestError' || errorObj?.code === 4001) {
        return;
      }
      console.warn('Direct connect fell back to modal:', err);
    }
    if (fallbackModal) fallbackModal();
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={() => handleDirectConnect(openConnectModal)}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/90 border border-white/[0.08] hover:border-white/[0.16] transition-all"
                  >
                    <MetaMaskLogo className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Switch to Sepolia</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/70 hover:text-white text-xs font-mono transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.14] text-white/90 text-xs font-mono transition-all group"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <EthereumMonochrome className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span className="truncate">{account.displayName}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white/70 shrink-0 ml-1 transition-colors" />
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

