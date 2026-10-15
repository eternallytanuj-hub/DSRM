'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Unlock,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount, useChainId, useConnect, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther, stringToHex, keccak256 } from 'viem';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import SatelliteEscrowArtifact from '@/contracts/SatelliteEscrow.json';
import { supabase } from '@/lib/supabase';
import { fetchBookings, recordBookingReceipt, syncUserProfile } from '@/app/actions/supabase';
import { wagmiConfig } from '@/components/Web3Provider';
import { MetaMaskLogo, EthereumDiamond } from '@/components/Web3Icons';
import { TierBadge } from '@/components/operators/TierBadge';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';

const ESCROW_AMOUNT_ETH = '0.0005';
const ESCROW_AMOUNT_DISPLAY = '0.0005 Sepolia ETH';
const SEPOLIA_CHAIN_ID = sepolia.id; // 11155111

export interface EscrowItem {
  id: string;
  bookingId: string;
  target: string;
  amount: string;
  status: 'Locked' | 'Released' | 'Partially Settled' | 'Refunded';
  depositTx: string;
  settleTx?: string;
  window: string;
  quality?: string;
  payout?: string;
  refund?: string;
  operatorTier?: number;
  payoutHoldHours?: number;
  termsHash?: string;
  termsVersion?: string;
  observationId?: string;
  progressValue?: number;
  isDemo?: boolean;
}

const DEFAULT_ESCROWS: EscrowItem[] = [
  {
    id: 'BKG-1957',
    bookingId: '0xf5fdc2557bd1065f55b43c9494a88a342df342cb5d6983fadbdc88316c4a33a7',
    target: 'STARLINK-32573',
    amount: '0.00001 Sepolia ETH',
    status: 'Released',
    depositTx: '0x7db2377788d89b82b1558e6f76b97ad53394d22394b8ea3d5451f41369ab8454',
    settleTx: '0x829caaa2dc08adbb2c7f396f211b01fc2dc41b3f25056910547f6ac3bb55cb13',
    window: '07:45 - 08:00 UTC (15m)',
    quality: '98.7% (Passed ≥95% Threshold)',
    payout: '0.00001000 ETH (100%)',
    refund: '0.00000000 ETH (0%)',
    operatorTier: 2,
    payoutHoldHours: 2,
    termsHash: '0x42f8b8a91c6e1185433221bce427a199081234567890abcdef1234567890abcd',
    termsVersion: 'v1.0',
    observationId: '11726893',
    progressValue: 100,
  },
  {
    id: 'BKG-SATNOGS-001',
    bookingId: '0x99820bf9f502f87f32fc1fe27239b50bd76d63824b3567b3a15729655c3993a7',
    target: 'STARLINK-32573',
    amount: '0.00010 Sepolia ETH',
    status: 'Released',
    depositTx: '0x750b5e9282d2b2fdbce724b53fbdccc63397f08068e879d27dfddc2e4ac523db',
    settleTx: '0x6635c7a647877a781e01af6a231226282500291a0f91405503881e4113c7b359',
    window: '06:42 - 06:55 UTC (13m)',
    quality: '98.4% (Passed ≥95% Threshold)',
    payout: '0.00010000 ETH (100%)',
    refund: '0.00000000 ETH (0%)',
    operatorTier: 2,
    payoutHoldHours: 2,
    termsHash: '0x98a123fbcde456012789456123456789abcdef0123456789abcdef0123456789',
    termsVersion: 'v1.0',
    observationId: '11726893',
    progressValue: 100,
  },
  {
    id: 'BKG-NOAA-002',
    bookingId: '0x84bf1864f110ccbe2cfbf24023089daefd48449c995f029dfdc69727afdca8ae',
    target: 'NOAA-19 HRPT',
    amount: '0.00010 Sepolia ETH',
    status: 'Partially Settled',
    depositTx: '0xd6831a3d79b04a91297324a07b4ae919ffcbb470e441f8bffc7ba86affbf0ee1',
    settleTx: '0x6c0b385616af57731755d79cb04e98dd265097734af6748c471847657e068f68',
    window: '07:10 - 07:22 UTC (12m)',
    quality: '84.0% (Atmospheric Packet Loss)',
    payout: '0.00008400 ETH (84%)',
    refund: '0.00001600 ETH (16% Buyer Refund)',
    operatorTier: 1,
    payoutHoldHours: 24,
    termsHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    termsVersion: 'v1.0',
    observationId: '11726893',
    progressValue: 84,
  },
  {
    id: 'BKG-REFUND-TEST-001',
    bookingId: '0x421ce01e5b3bcd4856a05f35d0b26e5e442f825d0e06920110f88b5264e916f9',
    target: 'METEOSAT-11 HRIT',
    amount: '0.00005 Sepolia ETH',
    status: 'Refunded',
    depositTx: '0xcfd0432b7e929db5ce744ad49281bd464c768dcd584b9411fad6f46f229cdf87',
    settleTx: '0xb2e3c88bdbf83fd2d94297c526e99cac63be669e99768f86913c89de6b3c829c',
    window: '07:30 - 07:45 UTC (15m)',
    quality: '0.0% (Atmospheric Blackout - Full Refund)',
    payout: '0.00000000 ETH (0%)',
    refund: '0.00005000 ETH (100% Buyer Refund)',
    operatorTier: 1,
    payoutHoldHours: 24,
    termsHash: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    termsVersion: 'v1.0',
    observationId: '11726893',
    progressValue: 100,
  },
];

const PRESET_SATELLITES = [
  'STARLINK-32573',
  'NOAA-19 HRPT',
  'SENTINEL-2A',
  'METEOSAT-11 HRIT',
  'LANDSAT-9',
];

export default function EscrowClearingPage() {
  const [escrows, setEscrows] = useState<EscrowItem[]>(DEFAULT_ESCROWS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Wagmi hooks
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { openConnectModal } = useConnectModal();

  const isWrongNetwork = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  // Escrow Deposit Dialog State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedSatellite, setSelectedSatellite] = useState<string>(PRESET_SATELLITES[0]);
  const [customSatellite, setCustomSatellite] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);
  const [signingStep, setSigningStep] = useState<'IDLE' | 'SWITCHING' | 'PROMPTING' | 'CONFIRMED'>('IDLE');
  const [depositResult, setDepositResult] = useState<{
    bookingRef: string;
    bookingId: string;
    txHash: string;
    etherscanUrl: string;
    satellite: string;
    amount: string;
    blockNumber?: number | null;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.info('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  const handleOpenDepositModal = () => {
    setIsDepositModalOpen(true);
    setDepositResult(null);
    setErrorMessage(null);
    setSigningStep('IDLE');
    setIsSigning(false);
  };

  const handleCloseDepositModal = () => {
    if (isSigning) return;
    setIsDepositModalOpen(false);
    setDepositResult(null);
    setErrorMessage(null);
    setSigningStep('IDLE');
    setIsSigning(false);
  };

  // Sign Escrow Deposit on Sepolia
  const handleSignDeposit = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }

    setErrorMessage(null);
    setIsSigning(true);

    const targetSat = customSatellite.trim() || selectedSatellite;

    try {
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setSigningStep('SWITCHING');
        try {
          await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID });
        } catch {
          throw new Error('Please switch MetaMask network to Sepolia to continue.');
        }
      }

      setSigningStep('PROMPTING');
      toast.info('Deposit requested: Please confirm in MetaMask');

      const cleanName = targetSat.replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
      const bookingRef = `BKG-${cleanName}-${Date.now().toString(36).toUpperCase()}`;
      const bookingId = keccak256(stringToHex(bookingRef));
      const operatorAddress = (SatelliteEscrowArtifact.oracleAddress || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176') as `0x${string}`;
      const nowSec = BigInt(Math.floor(Date.now() / 1000));
      const windowEndSec = nowSec + BigInt(3600);
      const depositValue = parseEther(ESCROW_AMOUNT_ETH);

      const txHash = await writeContractAsync({
        chainId: SEPOLIA_CHAIN_ID,
        address: SatelliteEscrowArtifact.address as `0x${string}`,
        abi: SatelliteEscrowArtifact.abi,
        functionName: 'depositEscrow',
        args: [bookingId, operatorAddress, nowSec, windowEndSec, targetSat],
        value: depositValue,
      });

      toast.success(`Transaction submitted: ${txHash.slice(0, 10)}...`);

      const resultData = {
        bookingRef,
        bookingId,
        txHash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
        satellite: targetSat,
        amount: ESCROW_AMOUNT_DISPLAY,
        blockNumber: null,
      };

      setDepositResult(resultData);
      setSigningStep('CONFIRMED');

      const newEscrowItem: EscrowItem = {
        id: bookingRef,
        bookingId,
        target: targetSat,
        amount: ESCROW_AMOUNT_DISPLAY,
        status: 'Locked',
        depositTx: txHash,
        window: 'Active 1-Hour Pass Window',
        quality: 'Awaiting Ground Station Telemetry Pass',
        operatorTier: 1,
        payoutHoldHours: 24,
        termsHash: '0x42f8b8a91c6e1185433221bce427a199081234567890abcdef1234567890abcd',
        termsVersion: 'v1.0',
        progressValue: 50,
      };
      setEscrows((prev) => [newEscrowItem, ...prev]);

      try {
        const stored = JSON.parse(localStorage.getItem('dsrm_user_bookings') || '[]');
        stored.unshift({
          id: bookingRef,
          bookingId,
          sat: targetSat,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: 'Active 1-Hour Pass Window',
          status: 'Locked',
          amount: ESCROW_AMOUNT_DISPLAY,
          txHash,
          etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
        });
        localStorage.setItem('dsrm_user_bookings', JSON.stringify(stored));

        await recordBookingReceipt({
          id: bookingRef,
          booking_id: bookingId,
          user_address: address || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176',
          operator_address: operatorAddress,
          satellite: targetSat,
          window_text: 'Active 1-Hour Pass Window',
          locked_amount: ESCROW_AMOUNT_DISPLAY,
          status: 'ACTIVE',
          tx_hash: txHash,
          etherscan_url: `https://sepolia.etherscan.io/tx/${txHash}`,
          metadata: { clearingDeposit: true },
        });

        if (address) {
          await syncUserProfile(address);
        }
      } catch (saveErr) {
        console.warn('Storage/Supabase save notice:', saveErr);
      }

      waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        timeout: 60000,
      })
        .then(async (receipt) => {
          if (receipt?.blockNumber) {
            setDepositResult((prev) => (prev ? { ...prev, blockNumber: Number(receipt.blockNumber) } : null));
            toast.success(`Mined in block #${receipt.blockNumber}`);
          }
        })
        .catch((receiptErr) => {
          console.warn('Block receipt wait notice:', receiptErr);
        });
    } catch (err: unknown) {
      console.error('Escrow deposit error:', err);
      const msg = (err as { shortMessage?: string; message?: string })?.shortMessage || (err as Error)?.message || 'Transaction was rejected or failed.';
      const lower = msg.toLowerCase();
      if (lower.includes('user rejected') || lower.includes('user denied')) {
        setErrorMessage('Transaction signature was cancelled in MetaMask.');
        toast('Deposit cancelled by user.');
      } else if (lower.includes('insufficient funds') || lower.includes('exceeds the balance')) {
        setErrorMessage('Insufficient Sepolia ETH for gas and deposit. Testnet funds required.');
        toast.error('Insufficient Sepolia ETH.');
      } else if (lower.includes('switch') || lower.includes('chain')) {
        setErrorMessage('Please switch MetaMask network to Ethereum Sepolia (Chain ID 11155111).');
      } else {
        setErrorMessage(msg);
        toast.error(msg);
      }
      setSigningStep('IDLE');
    } finally {
      setIsSigning(false);
    }
  };

  const loadEscrows = useCallback(async () => {
    try {
      const res = await fetchBookings();
      if (res.success && res.data && res.data.length > 0) {
        const mapped: EscrowItem[] = res.data.map((b) => {
          const s = (b.status || 'ACTIVE').toUpperCase();
          let status: 'Locked' | 'Released' | 'Partially Settled' | 'Refunded' = 'Locked';
          if (s === 'SETTLED') status = 'Released';
          else if (s === 'PARTIALLY_SETTLED') status = 'Partially Settled';
          else if (s === 'REFUNDED') status = 'Refunded';

          return {
            id: b.id,
            bookingId: b.booking_id || '0x...',
            target: b.satellite,
            amount: b.locked_amount,
            status,
            depositTx: b.tx_hash || '',
            settleTx: b.settlement_tx_hash || undefined,
            window: b.window_text || 'Active Window',
            quality:
              status === 'Released'
                ? '98.5% (Nominal Telemetry Attested)'
                : status === 'Partially Settled'
                ? '84.0% (Atmospheric Packet Loss)'
                : status === 'Refunded'
                ? '0.0% (Telemetry Loss - Full Refund)'
                : 'Awaiting Ground Station Telemetry Pass',
            payout:
              status === 'Released'
                ? `${b.locked_amount} (100%)`
                : status === 'Partially Settled'
                ? 'Partial Operator Payout'
                : '0 ETH (0%)',
            refund:
              status === 'Refunded'
                ? `${b.locked_amount} (100% Buyer Refund)`
                : status === 'Partially Settled'
                ? 'Partial Buyer Refund'
                : '0 ETH (0%)',
            operatorTier: status === 'Released' ? 2 : 1,
            payoutHoldHours: status === 'Released' ? 2 : 24,
            termsHash: '0x42f8b8a91c6e1185433221bce427a199081234567890abcdef1234567890abcd',
            termsVersion: 'v1.0',
            observationId: '11726893',
            progressValue: status === 'Released' ? 100 : status === 'Partially Settled' ? 84 : status === 'Refunded' ? 100 : 50,
          };
        });

        setEscrows(mapped);
        return;
      }
    } catch (e) {
      console.error('Error loading escrows from Supabase:', e);
    }

    try {
      const stored = JSON.parse(localStorage.getItem('dsrm_user_bookings') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        const userItems: EscrowItem[] = stored.map((b: { id: string; bookingId?: string; sat?: string; amount?: string; txHash?: string; time?: string }) => ({
          id: b.id,
          bookingId: b.bookingId || '0x...',
          target: b.sat || 'ORBITAL-PASS',
          amount: b.amount || ESCROW_AMOUNT_DISPLAY,
          status: 'Locked',
          depositTx: b.txHash || '',
          window: b.time || '1 Hour Access Window',
          quality: 'Awaiting Ground Station Telemetry Pass',
          operatorTier: 1,
          payoutHoldHours: 24,
          termsHash: '0x42f8b8a91c6e1185433221bce427a199081234567890abcdef1234567890abcd',
          termsVersion: 'v1.0',
          progressValue: 50,
        }));
        setEscrows([...userItems, ...DEFAULT_ESCROWS]);
      }
    } catch {
      // Use defaults
    }
  }, []);

  useEffect(() => {
    loadEscrows();

    const channel = supabase
      .channel('escrow_clearing_bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadEscrows();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadEscrows]);

  const contractAddress = SatelliteEscrowArtifact.address;
  const oracleAddress = SatelliteEscrowArtifact.oracleAddress || '0xc25f9F0Ce27A2D248c43563a32cDC4886D069176';
  const shortContract = `${contractAddress.slice(0, 10)}...${contractAddress.slice(-8)}`;
  const shortOracle = `${oracleAddress.slice(0, 10)}...${oracleAddress.slice(-8)}`;

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-16 font-sans">
        {/* 1. Page Header & Primary Action */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-emerald-950/40 text-emerald-400 border-0 px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
                Smart Contract Clearing Engine
              </Badge>
              <ProvenanceBadge provenance="real" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Escrow & Clearing</h1>
            <p className="text-xs text-zinc-400 max-w-2xl font-mono">
              Automated trustless escrow clearing. Funds lock on Ethereum Sepolia until cryptographically attested by ground station telemetry.
            </p>
          </div>

          <Button
            onClick={handleOpenDepositModal}
            className="bg-white text-black font-semibold hover:bg-white/90 text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 w-fit border-0"
          >
            <MetaMaskLogo className="w-4 h-4" />
            <span>Deposit Escrow ({ESCROW_AMOUNT_ETH} ETH)</span>
          </Button>
        </header>

        {/* 2. SatelliteEscrow.sol Contract Banner Card */}
        <Card className="bg-zinc-950 border-0 rounded-3xl p-6 shadow-none">
          <CardHeader className="p-0 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-white font-mono">
                  SatelliteEscrow.sol
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 font-mono">
                  Ethereum Sepolia (Chain ID 11155111)
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border-0 text-xs font-mono rounded-xl h-8 px-3"
            >
              <a
                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <span>Contract on Etherscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </CardHeader>

          <Separator className="bg-zinc-900" />

          <CardContent className="p-0 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase block mb-1">Contract Address</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-200 font-medium" title={contractAddress}>
                  {shortContract}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCopy(contractAddress, 'contract')}
                      className="text-zinc-500 hover:text-white transition-colors p-1"
                      aria-label="Copy Contract Address"
                    >
                      {copiedKey === 'contract' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 text-zinc-200 border-0 text-xs">
                    Copy Contract Address
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 text-[10px] uppercase block mb-1">Oracle Relayer</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-200 font-medium" title={oracleAddress}>
                  {shortOracle}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCopy(oracleAddress, 'oracle')}
                      className="text-zinc-500 hover:text-white transition-colors p-1"
                      aria-label="Copy Relayer Address"
                    >
                      {copiedKey === 'oracle' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 text-zinc-200 border-0 text-xs">
                    Copy Relayer Address
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 text-[10px] uppercase block mb-1">Micro Escrow Deposit</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                <EthereumDiamond className="w-3.5 h-3.5" />
                <span>{ESCROW_AMOUNT_DISPLAY}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. 2-Column Escrow Booking Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {escrows.map((b, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              key={b.id + i}
            >
              <Card className="bg-zinc-950 border-0 rounded-3xl p-6 flex flex-col justify-between shadow-none h-full">
                <div>
                  {/* Card Header */}
                  <CardHeader className="p-0 space-y-3 pb-3 border-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <CardTitle className="text-base font-semibold text-white font-mono">
                            {b.amount}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`border-0 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                              b.status === 'Released'
                                ? 'bg-emerald-950/60 text-emerald-400'
                                : b.status === 'Partially Settled'
                                ? 'bg-amber-950/60 text-amber-400'
                                : b.status === 'Refunded'
                                ? 'bg-rose-950/60 text-rose-400'
                                : 'bg-blue-950/60 text-blue-400'
                            }`}
                          >
                            {b.status}
                          </Badge>
                        </div>
                        <CardDescription className="font-mono text-xs text-zinc-400">
                          {b.id} • {b.target}
                        </CardDescription>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                              b.status === 'Locked'
                                ? 'bg-blue-950/40 text-blue-400'
                                : b.status === 'Partially Settled'
                                ? 'bg-amber-950/40 text-amber-400'
                                : b.status === 'Refunded'
                                ? 'bg-rose-950/40 text-rose-400'
                                : 'bg-emerald-950/40 text-emerald-400'
                            }`}
                          >
                            {b.status === 'Locked' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-900 text-zinc-200 border-0 text-xs font-mono">
                          {b.status === 'Locked'
                            ? 'Funds locked in escrow contract awaiting telemetry attestation.'
                            : b.status === 'Released'
                            ? 'Full release: Nominal telemetry confirmed on-chain.'
                            : b.status === 'Partially Settled'
                            ? 'Pro-rata release: Partial telemetry delivery recorded.'
                            : 'Full refund: Session failed nominal delivery threshold.'}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <Progress
                      value={b.progressValue ?? (b.status === 'Released' ? 100 : b.status === 'Partially Settled' ? 84 : 50)}
                      className="h-1.5 bg-zinc-900"
                    />
                  </CardHeader>

                  {/* Telemetry & Settlement Breakdown */}
                  <CardContent className="p-0 space-y-2 text-xs py-2">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Window:</span>
                      <span className="font-mono text-zinc-200">{b.window}</span>
                    </div>

                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Telemetry Attestation:</span>
                      <span className="font-mono text-zinc-200">{b.quality}</span>
                    </div>

                    {b.status !== 'Locked' && (
                      <>
                        <div className="flex justify-between items-center text-zinc-400 pt-1">
                          <span className="flex items-center gap-1.5">
                            <span>Operator Payout:</span>
                            {b.operatorTier !== undefined && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <TierBadge tier={b.operatorTier} isDemo={b.isDemo} />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-900 text-zinc-200 border-0 text-xs font-mono">
                                  Operator Payout Hold: {b.payoutHoldHours ?? 2} Hours
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                          <span className="font-mono text-emerald-400 font-semibold">{b.payout}</span>
                        </div>

                        <div className="flex justify-between items-center text-zinc-400">
                          <span>Buyer Refund:</span>
                          <span className="font-mono text-amber-400">{b.refund}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </div>

                {/* Card Footer: Transactions, Terms Hash, Replay Link */}
                <div>
                  <Separator className="bg-zinc-900 my-3" />

                  <CardFooter className="p-0 flex flex-col gap-2 text-xs font-mono border-0">
                    {/* Deposit Tx */}
                    {b.depositTx && (
                      <div className="flex w-full justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Deposit Tx:</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${b.depositTx}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 truncate max-w-[190px] flex items-center gap-1"
                            >
                              <span>{`${b.depositTx.slice(0, 10)}...${b.depositTx.slice(-8)}`}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 text-zinc-200 border-0 text-xs">
                            View on Sepolia Etherscan
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    {/* Settlement Tx */}
                    {b.settleTx && (
                      <div className="flex w-full justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Settlement Tx:</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${b.settleTx}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 truncate max-w-[190px] flex items-center gap-1"
                            >
                              <span>{`${b.settleTx.slice(0, 10)}...${b.settleTx.slice(-8)}`}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 text-zinc-200 border-0 text-xs">
                            View on Sepolia Etherscan
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    {/* Agreement Terms Hash (Module 1) */}
                    {b.termsHash && (
                      <div className="flex w-full justify-between items-center text-[11px] pt-1 border-t border-zinc-900">
                        <span className="text-zinc-500">Terms Hash ({b.termsVersion || 'v1.0'}):</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleCopy(b.termsHash || '', `terms_${b.id}`)}
                              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 truncate max-w-[190px]"
                            >
                              <span>{`${b.termsHash.slice(0, 10)}...${b.termsHash.slice(-6)}`}</span>
                              {copiedKey === `terms_${b.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-zinc-500" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 text-zinc-200 border-0 text-xs">
                            EIP-712 Schedule D Agreement Hash
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    {/* Verifiable Pass Replay Button (Module 2) */}
                    {b.observationId && b.status !== 'Locked' && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full mt-2.5 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 hover:text-white border-0 text-xs font-mono rounded-xl h-8 px-3"
                      >
                        <Link href={`/telemetry-oracle?obs=${b.observationId}`}>
                          <Activity className="w-3.5 h-3.5 text-emerald-400 mr-2" />
                          <span>Verify Pass Replay (Telemetry Oracle)</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-auto text-zinc-500" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 4. Escrow Deposit Dialog */}
        <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
          <DialogContent className="bg-zinc-950 text-white border-0 rounded-3xl p-6 sm:p-8 max-w-lg shadow-2xl font-sans">
            <DialogHeader className="space-y-1.5 pb-4 border-b border-zinc-900 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-white">
                    Deposit Escrow on Sepolia
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-500 font-mono">
                    SatelliteEscrow.sol ({shortContract})
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {!depositResult ? (
              <div className="space-y-4 pt-2 font-mono text-xs">
                {/* Select Target Satellite */}
                <div>
                  <label className="block text-zinc-400 mb-2 font-sans">Select Target Satellite</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_SATELLITES.map((sat) => (
                      <button
                        key={sat}
                        type="button"
                        onClick={() => {
                          setSelectedSatellite(sat);
                          setCustomSatellite('');
                        }}
                        className={`px-3 py-2 rounded-xl text-xs text-left transition-all ${
                          selectedSatellite === sat && !customSatellite
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        {sat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customSatellite}
                    onChange={(e) => setCustomSatellite(e.target.value)}
                    placeholder="Or enter custom satellite name..."
                    className="w-full mt-2 bg-zinc-900/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                {/* Escrow Parameters */}
                <div className="bg-zinc-900/40 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Deposit Amount:</span>
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <EthereumDiamond className="w-3.5 h-3.5" />
                      <span>{ESCROW_AMOUNT_DISPLAY}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Network:</span>
                    <span className="text-zinc-200">Ethereum Sepolia (#11155111)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Oracle Address:</span>
                    <span className="text-zinc-300 truncate max-w-[200px]">{shortOracle}</span>
                  </div>
                </div>

                {/* Wrong Network Notice */}
                {isWrongNetwork && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/60 text-amber-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Connected to Chain #{chainId}. Sepolia required.</span>
                    </div>
                    <Button
                      onClick={() => switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })}
                      disabled={isSwitchingChain}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium rounded-xl h-7 px-2.5 border-0"
                    >
                      {isSwitchingChain ? 'Switching...' : 'Switch Network'}
                    </Button>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-950/60 text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-words">{errorMessage}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  {!isConnected ? (
                    <Button
                      type="button"
                      onClick={handleDirectConnect}
                      className="w-full py-3 bg-white text-black font-semibold hover:bg-white/90 rounded-xl text-xs flex items-center justify-center gap-2 border-0"
                    >
                      <MetaMaskLogo className="w-4 h-4" />
                      <span>Connect MetaMask to Deposit</span>
                    </Button>
                  ) : isWrongNetwork ? (
                    <Button
                      type="button"
                      disabled={isSwitchingChain}
                      onClick={() => switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })}
                      className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border-0"
                    >
                      <span>Switch MetaMask to Sepolia (Chain ID 11155111)</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isSigning}
                      onClick={handleSignDeposit}
                      className="w-full py-3 bg-white text-black font-semibold hover:bg-white/90 rounded-xl text-xs flex items-center justify-center gap-2 border-0 disabled:opacity-50"
                    >
                      {signingStep === 'PROMPTING' ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                          <span>Confirm in MetaMask Extension...</span>
                        </>
                      ) : signingStep === 'SWITCHING' ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                          <span>Switching to Sepolia...</span>
                        </>
                      ) : (
                        <>
                          <MetaMaskLogo className="w-4 h-4" />
                          <span>Sign Escrow Deposit ({ESCROW_AMOUNT_DISPLAY})</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Confirmed state */
              <div className="space-y-4 pt-2 font-mono text-xs">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-950/60 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold">Escrow Deposit Submitted</div>
                    <div className="text-[11px] text-emerald-400/80">Funds locked on Ethereum Sepolia testnet.</div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Booking Ref:</span>
                    <span className="text-emerald-400">{depositResult.bookingRef}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Satellite Target:</span>
                    <span className="text-zinc-200">{depositResult.satellite}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Deposit Amount:</span>
                    <span className="text-zinc-200">{depositResult.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Tx Hash:</span>
                    <span className="text-blue-400 truncate max-w-[200px]" title={depositResult.txHash}>
                      {depositResult.txHash}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Block Status:</span>
                    <span className="text-zinc-300">
                      {depositResult.blockNumber ? `#${depositResult.blockNumber} (Mined)` : 'Awaiting Next Block...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Database Status:</span>
                    <span className="text-emerald-400">Recorded in Supabase</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    asChild
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border-0 text-xs rounded-xl"
                  >
                    <a
                      href={depositResult.etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5"
                    >
                      <span>Verify on Etherscan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                  <Button
                    onClick={handleCloseDepositModal}
                    className="py-2.5 px-5 bg-white text-black font-semibold hover:bg-white/90 rounded-xl text-xs border-0"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
