'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Satellite, 
  Clock, 
  Wifi, 
  Radio, 
  Globe2, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useChainId, useConnect, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther, stringToHex, keccak256 } from 'viem';
import { sepolia } from 'wagmi/chains';

import { searchMarketplaceWithGroq } from './actions';
import { DEFAULT_REAL_PASSES, SatellitePass } from './types';
import SatelliteEscrowArtifact from '@/contracts/SatelliteEscrow.json';
import { recordBookingReceipt, fetchOperatorListings, syncUserProfile, updateOperatorListingStatus } from '@/app/actions/supabase';
import { supabase } from '@/lib/supabase';
import { wagmiConfig } from '@/components/Web3Provider';
import { MetaMaskLogo, EthereumDiamond } from '@/components/Web3Icons';

const ESCROW_AMOUNT_ETH = '0.0005';
const ESCROW_AMOUNT_DISPLAY = '0.0005 Sepolia ETH';
const SEPOLIA_CHAIN_ID = sepolia.id; // 11155111

const SAMPLE_QUERIES = [
  "High-speed broadband pass over South Asia / India",
  "Optical Earth observation imagery with >400 Mbps downlink",
  "Ultra-low latency IoT and telemetry relay (L-Band)",
  "Continuous geostationary weather & atmospheric tracking"
];

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [passes, setPasses] = useState<SatellitePass[]>(DEFAULT_REAL_PASSES);

  // Wagmi hooks
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { openConnectModal } = useConnectModal();

  const handleDirectConnect = async () => {
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
    if (openConnectModal) openConnectModal();
  };

  // Booking Modal State
  const [selectedPass, setSelectedPass] = useState<SatellitePass | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingStep, setSigningStep] = useState<'IDLE' | 'SWITCHING' | 'PROMPTING' | 'CONFIRMED'>('IDLE');
  const [bookingResult, setBookingResult] = useState<{
    pass: SatellitePass;
    bookingRef: string;
    bookingId: string;
    txHash: string;
    etherscanUrl: string;
    amount: string;
    blockNumber?: number | null;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isWrongNetwork = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  // Open booking modal
  const handleOpenBooking = (p: SatellitePass) => {
    setSelectedPass(p);
    setBookingResult(null);
    setErrorMessage(null);
    setSigningStep('IDLE');
    setIsSigning(false);
  };

  const handleCloseModal = () => {
    if (isSigning) return; // Prevent closing while transaction is in flight
    setSelectedPass(null);
    setBookingResult(null);
    setErrorMessage(null);
    setSigningStep('IDLE');
    setIsSigning(false);
  };

  // Sign MetaMask Escrow Transaction
  const handleSignTransaction = async () => {
    if (!selectedPass) return;

    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }

    setErrorMessage(null);
    setIsSigning(true);

    try {
      // 1. Ensure wallet is on Ethereum Sepolia
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setSigningStep('SWITCHING');
        try {
          await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID });
        } catch {
          throw new Error("Please switch MetaMask network to Sepolia to continue.");
        }
      }

      setSigningStep('PROMPTING');

      // 2. Prepare transaction inputs
      const p = selectedPass;
      const cleanName = p.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
      const bookingRef = `BKG-${cleanName}-${Date.now().toString(36).toUpperCase()}`;
      const bookingId = keccak256(stringToHex(bookingRef));
      const operatorAddress = ((p.operatorAddress && p.operatorAddress.startsWith('0x')) ? p.operatorAddress : (SatelliteEscrowArtifact.oracleAddress || "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176")) as `0x${string}`;
      const nowSec = BigInt(Math.floor(Date.now() / 1000));
      const windowEndSec = nowSec + BigInt(3600);
      const depositValue = parseEther(ESCROW_AMOUNT_ETH);

      // 3. Prompt MetaMask client-side signature
      const txHash = await writeContractAsync({
        chainId: SEPOLIA_CHAIN_ID,
        address: SatelliteEscrowArtifact.address as `0x${string}`,
        abi: SatelliteEscrowArtifact.abi,
        functionName: 'depositEscrow',
        args: [
          bookingId,
          operatorAddress,
          nowSec,
          windowEndSec,
          p.name
        ],
        value: depositValue,
      });

      // 4. Immediately record the transaction and update UI
      const resultData = {
        pass: p,
        bookingRef,
        bookingId,
        txHash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
        amount: ESCROW_AMOUNT_DISPLAY,
        blockNumber: null,
      };

      setBookingResult(resultData);
      setSigningStep('CONFIRMED');

      // Save to localStorage for immediate offline persistence
      try {
        const stored = JSON.parse(localStorage.getItem('dsrm_user_bookings') || '[]');
        stored.unshift({
          id: bookingRef,
          bookingId,
          sat: p.name,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: p.window || 'Active Window',
          status: 'Locked',
          amount: ESCROW_AMOUNT_DISPLAY,
          txHash,
          etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
        });
        localStorage.setItem('dsrm_user_bookings', JSON.stringify(stored));

        // Insert booking receipt directly into Supabase PostgreSQL
        await recordBookingReceipt({
          id: bookingRef,
          booking_id: bookingId,
          user_address: address || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176',
          operator_address: operatorAddress,
          satellite: p.name,
          norad_id: p.noradId,
          window_text: p.window || 'Active Window',
          locked_amount: ESCROW_AMOUNT_DISPLAY,
          status: 'ACTIVE',
          tx_hash: txHash,
          etherscan_url: `https://sepolia.etherscan.io/tx/${txHash}`,
          metadata: {
            operator: p.operator,
            speed: p.speed,
            cat: p.cat,
          }
        });

        if (address) {
          await syncUserProfile(address);
        }

        if (p.operatorListingId) {
          await updateOperatorListingStatus(p.operatorListingId, 'BOOKED');
        }

        // Notify oracle relayer
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        fetch(`${backendUrl}/api/v1/telemetry/register-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingRef,
            bookingId,
            userAddress: address,
            satellite: p.name,
            operator: operatorAddress,
            txHash
          })
        }).catch(() => {});
      } catch (saveErr) {
        console.warn("Storage/Supabase update notice:", saveErr);
      }

      // 5. Asynchronously wait for block confirmation in background
      waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        timeout: 60000,
      }).then(async (receipt) => {
        if (receipt?.blockNumber) {
          setBookingResult(prev => prev ? { ...prev, blockNumber: Number(receipt.blockNumber) } : null);
          await recordBookingReceipt({
            id: bookingRef,
            booking_id: bookingId,
            user_address: address || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176',
            operator_address: operatorAddress,
            satellite: p.name,
            norad_id: p.noradId,
            window_text: p.window || 'Active Window',
            locked_amount: ESCROW_AMOUNT_DISPLAY,
            status: 'ACTIVE',
            tx_hash: txHash,
            etherscan_url: `https://sepolia.etherscan.io/tx/${txHash}`,
            metadata: {
              operator: p.operator,
              speed: p.speed,
              cat: p.cat,
              blockNumber: Number(receipt.blockNumber),
              gasUsed: receipt.gasUsed?.toString(),
            }
          });
        }
      }).catch((receiptErr) => {
        console.warn("Block confirmation monitor notice:", receiptErr);
      });

    } catch (err: any) {
      console.error("Lock escrow error:", err);
      const msg = err?.shortMessage || err?.message || "Transaction was rejected or failed.";
      const lower = msg.toLowerCase();
      if (lower.includes('user rejected') || lower.includes('user denied')) {
        setErrorMessage("Transaction signature was cancelled in MetaMask.");
      } else if (lower.includes('insufficient funds') || lower.includes('exceeds the balance')) {
        setErrorMessage("Insufficient Sepolia ETH for gas and deposit. Testnet funds required.");
      } else if (lower.includes('switch') || lower.includes('chain')) {
        setErrorMessage("Please switch MetaMask network to Ethereum Sepolia (Chain ID 11155111).");
      } else {
        setErrorMessage(msg);
      }
      setSigningStep('IDLE');
    } finally {
      setIsSigning(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [backendRes, operatorRes] = await Promise.allSettled([
          fetch('https://dsrmbackend-production.up.railway.app/api/v1/marketplace/passes').then(r => r.ok ? r.json() : null),
          fetchOperatorListings()
        ]);

        let basePasses: SatellitePass[] = DEFAULT_REAL_PASSES;
        if (backendRes.status === 'fulfilled' && backendRes.value?.passes?.length > 0) {
          basePasses = backendRes.value.passes;
        }

        if (operatorRes.status === 'fulfilled' && operatorRes.value?.success && operatorRes.value?.data?.length > 0) {
          const availableOps = operatorRes.value.data.filter(op => op.status === 'AVAILABLE');
          const operatorPasses: SatellitePass[] = availableOps.map(op => ({
            id: `OP-${op.id.slice(0, 8)}`,
            operatorListingId: op.id,
            operatorAddress: op.operator_address || undefined,
            noradId: op.norad_id || undefined,
            name: op.satellite_name,
            operator: `${op.operator_name} (Operator)`,
            cat: op.category?.toLowerCase() || 'communication',
            speed: `${op.bandwidth || '500 Mbps'} (${op.band || 'Ku/Ka-Band'})`,
            window: op.window_display || 'On-Demand Window',
            price: op.price_eth || ESCROW_AMOUNT_DISPLAY
          }));

          const combined = [...operatorPasses, ...basePasses];
          setPasses(combined);
          setInitialPasses(combined);
        } else {
          setPasses(basePasses);
          setInitialPasses(basePasses);
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadData();

    const channel = supabase
      .channel('marketplace_operator_listings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operator_listings' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPasses(initialPasses);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchMarketplaceWithGroq(searchQuery, initialPasses);
      if (results && results.length > 0) {
        setPasses(results);
      }
    } catch (e) {
      console.error("Marketplace search failed:", e);
    }
    setIsSearching(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleChipClick = (sample: string) => {
    setQuery(sample);
    executeSearch(sample);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-mono mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          Space-Track.org Verified Fleet
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white/95">Orbital Resource Marketplace</h1>
        <p className="text-white/50 mt-1.5 text-sm max-w-2xl">
          Reserve communication and observation passes. Trustless cryptographic clearing on Ethereum Sepolia testnet.
        </p>
      </header>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center bg-white/[0.03] border border-white/[0.08] focus-within:border-white/20 rounded-2xl p-2 transition-colors">
          <div className="pl-4 pr-3 text-white/40">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search passes (e.g., low latency pass over India tomorrow morning)..."
            className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 text-sm py-2.5 font-normal"
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 border border-white/[0.06]"
          >
            {isSearching ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Cpu size={14} className="text-white/80" />
                <span>Find Passes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Search Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <span className="text-white/30 font-mono text-[11px]">PROMPTS:</span>
        {SAMPLE_QUERIES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(sample)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/70 hover:text-white transition-all text-left truncate max-w-xs text-xs"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Satellite Pass Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {passes.map((p, i) => (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            key={p.id}
            className="bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
                    <Satellite className="text-white/80 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white/95 text-sm tracking-tight">{p.name}</h3>
                    <p className="text-xs text-white/40">{p.operator}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-sm font-semibold text-white/90 font-mono">
                    <EthereumDiamond className="w-3.5 h-3.5" />
                    <span>{ESCROW_AMOUNT_ETH}</span>
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">SEPOLIA ETH</div>
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-2 my-4 pt-3 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    Window:
                  </span>
                  <span className="font-mono text-white/90">{p.window}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Wifi className="w-3.5 h-3.5" />
                    Throughput:
                  </span>
                  <span className="font-mono text-white/90">{p.speed}</span>
                </div>
                {p.alt && (
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span className="flex items-center gap-1.5 text-white/40">
                      <Globe2 className="w-3.5 h-3.5" />
                      Altitude:
                    </span>
                    <span className="font-mono text-white/90">{p.alt} km</span>
                  </div>
                )}
                {p.noradId && (
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span className="flex items-center gap-1.5 text-white/40">
                      <Radio className="w-3.5 h-3.5" />
                      NORAD Cat ID:
                    </span>
                    <span className="font-mono text-white/50">#{p.noradId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => handleOpenBooking(p)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/90 hover:text-white border border-white/[0.08] hover:border-white/[0.16]"
            >
              <MetaMaskLogo className="w-3.5 h-3.5" />
              <span>Book Pass ({ESCROW_AMOUNT_ETH} Sepolia ETH)</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Booking & Transaction Signing Modal */}
      <AnimatePresence>
        {selectedPass && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-[#0B0C12] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Satellite className="w-4 h-4 text-white/80" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white/95">{selectedPass.name}</h3>
                    <p className="text-xs text-white/40">{selectedPass.operator}</p>
                  </div>
                </div>
                {!isSigning && (
                  <button
                    onClick={handleCloseModal}
                    className="text-white/40 hover:text-white transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* State 1: Booking Review & Sign Prompt */}
              {!bookingResult ? (
                <div className="space-y-4">
                  {/* Reservation Parameters */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Pass Window:</span>
                      <span className="text-white/90">{selectedPass.window}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Downlink Bandwidth:</span>
                      <span className="text-white/90">{selectedPass.speed}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Escrow Deposit:</span>
                      <span className="text-emerald-400 font-semibold">{ESCROW_AMOUNT_DISPLAY}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Network:</span>
                      <span className="text-white/80">Ethereum Sepolia (Chain ID 11155111)</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Smart Contract:</span>
                      <span className="text-white/60 truncate max-w-[200px]" title={SatelliteEscrowArtifact.address}>
                        {SatelliteEscrowArtifact.address}
                      </span>
                    </div>
                  </div>

                  {/* Escrow Rule Note */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-white/50 leading-relaxed">
                    Funds lock in the smart contract until pass completion. The Telemetry Oracle cryptographically attests packet delivery (≥95% nominal packet delivery releases 100% to operator; under-delivery triggers proportional refund).
                  </div>

                  {/* Network Notice if on wrong network */}
                  {isWrongNetwork && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Connected to Chain #{chainId}. Sepolia required.</span>
                      </div>
                      <button
                        onClick={() => switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })}
                        disabled={isSwitchingChain}
                        className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-medium border border-amber-400/30 transition-colors shrink-0"
                      >
                        {isSwitchingChain ? 'Switching...' : 'Switch Network'}
                      </button>
                    </div>
                  )}

                  {/* Error display */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="break-words">{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2">
                    {!isConnected ? (
                      <button
                        type="button"
                        onClick={handleDirectConnect}
                        className="w-full py-3 px-4 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] transition-colors flex items-center justify-center gap-2.5"
                      >
                        <MetaMaskLogo className="w-4 h-4" />
                        <span>Connect MetaMask to Book</span>
                      </button>
                    ) : isWrongNetwork ? (
                      <button
                        type="button"
                        disabled={isSwitchingChain}
                        onClick={() => switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })}
                        className="w-full py-3 px-4 rounded-xl text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Switch MetaMask to Sepolia (Chain ID 11155111)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSigning}
                        onClick={handleSignTransaction}
                        className="w-full py-3 px-4 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] hover:border-white/[0.2] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                      >
                        {signingStep === 'PROMPTING' ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Confirm in MetaMask Extension...</span>
                          </>
                        ) : signingStep === 'SWITCHING' ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Switching to Sepolia...</span>
                          </>
                        ) : (
                          <>
                            <MetaMaskLogo className="w-4 h-4" />
                            <span>Sign with MetaMask ({ESCROW_AMOUNT_DISPLAY})</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* State 2: Transaction Confirmed on Sepolia */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Escrow Transaction Submitted</div>
                      <div className="text-[11px] text-emerald-400/80">Funds locked on Ethereum Sepolia testnet.</div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Booking Ref:</span>
                      <span className="text-emerald-400">{bookingResult.bookingRef}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Locked Deposit:</span>
                      <span className="text-white/90">{bookingResult.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Contract Address:</span>
                      <span className="text-white/60 truncate max-w-[200px]" title={SatelliteEscrowArtifact.address}>
                        {SatelliteEscrowArtifact.address}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Tx Hash:</span>
                      <span className="text-blue-400 truncate max-w-[200px]" title={bookingResult.txHash}>
                        {bookingResult.txHash}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Block Confirmation:</span>
                      <span className="text-white/80">
                        {bookingResult.blockNumber ? `#${bookingResult.blockNumber} (Mined)` : 'Awaiting Next Block...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="text-white/40 font-sans">Database Sync:</span>
                      <span className="text-emerald-400">Recorded in Supabase</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={bookingResult.etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Verify on Etherscan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/escrow-clearing"
                      className="py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Clearing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleCloseModal}
                      className="py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/[0.12] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
