"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  CheckSquare,
  Shield,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  FastForward,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StepSchedule } from "./StepSchedule";
import { StepTerms } from "./StepTerms";
import { StepAcknowledgements } from "./StepAcknowledgements";
import { StepSign } from "./StepSign";
import { ScheduleFormData } from "@/lib/agreement/schema";
import {
  saveBookingDraft,
  loadBookingDraft,
  clearBookingDraft,
  StoredAcknowledgement,
} from "@/lib/agreement/state";
import { parseAgreementTerms } from "@/lib/agreement/terms";
import { SatellitePass } from "@/app/(stitch)/marketplace/types";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts/satelliteEscrow";
import { RAW_AGREEMENT_MARKDOWN } from "@/content/legal/agreementText";
import { generateBookingId } from "@/lib/agreement/hashes";
import { parseEther } from "viem";

interface BookingWizardProps {
  listing: SatellitePass;
}

const STEPS = [
  { id: 1, tabKey: "schedule", title: "Schedule", sub: "Part A & Use", icon: Calendar },
  { id: 2, tabKey: "terms", title: "Terms", sub: "Part B & Rules", icon: FileText },
  { id: 3, tabKey: "acks", title: "Acknowledgements", sub: "Part C Assents", icon: CheckSquare },
  { id: 4, tabKey: "sign", title: "Sign & Escrow", sub: "EIP-712 Deposit", icon: Shield },
];

export function BookingWizard({ listing }: BookingWizardProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [scheduleData, setScheduleData] = useState<ScheduleFormData | null>(null);
  const [isReadCompleted, setIsReadCompleted] = useState<boolean>(false);
  const [readTermsHash, setReadTermsHash] = useState<string>("");
  const [acknowledgements, setAcknowledgements] = useState<Record<string, StoredAcknowledgement>>({});
  const [completedBooking, setCompletedBooking] = useState<{ bookingRef: string; txHash: string } | null>(null);

  const prevAddressRef = useRef<string | undefined>(address);
  const prevChainIdRef = useRef<number | undefined>(chainId);
  const stepHeadingRef = useRef<HTMLDivElement>(null);

  // Parse terms canonical hash and version
  const parsedTerms = React.useMemo(() => {
    return parseAgreementTerms(RAW_AGREEMENT_MARKDOWN);
  }, []);

  // Listing price in wei
  const listingPriceWei = React.useMemo(() => {
    if (listing.price && listing.price.includes("ETH")) {
      const match = listing.price.match(/([0-9.]+)/);
      try {
        return parseEther(match ? match[1] : "0.0001").toString();
      } catch {
        return parseEther("0.0001").toString();
      }
    }
    return parseEther("0.0001").toString();
  }, [listing.price]);

  // Restore draft from sessionStorage
  useEffect(() => {
    if (!address) return;
    const draft = loadBookingDraft(listing.id, address);
    if (draft) {
      if (draft.formValues) {
        setScheduleData(draft.formValues as ScheduleFormData);
      }
      if (draft.readCompleted && draft.readTermsHash === parsedTerms.termsHash) {
        setIsReadCompleted(true);
        setReadTermsHash(draft.readTermsHash);
      }
      if (draft.acknowledgements) {
        setAcknowledgements(draft.acknowledgements);
      }
      if (draft.currentStep && draft.currentStep >= 1 && draft.currentStep <= 4) {
        setActiveStep(draft.currentStep);
      }
    }
  }, [listing.id, address, parsedTerms.termsHash]);

  // Invalidate signature and Step 4 state if account or chain changes mid-flow
  useEffect(() => {
    if (prevAddressRef.current && prevAddressRef.current !== address) {
      // Account changed: invalidate signature, reset Step 4 state, return to Step 1
      setActiveStep(1);
      setCompletedBooking(null);
      if (listing.id && prevAddressRef.current) {
        clearBookingDraft(listing.id, prevAddressRef.current);
      }
    }
    prevAddressRef.current = address;

    if (prevChainIdRef.current && prevChainIdRef.current !== chainId) {
      // Chain changed: reset Step 4 state and return to earliest affected step (Step 2)
      if (activeStep >= 3) {
        setActiveStep(2);
      }
      setCompletedBooking(null);
    }
    prevChainIdRef.current = chainId;
  }, [address, chainId, activeStep, listing.id]);

  // Persist draft to sessionStorage whenever state changes
  useEffect(() => {
    if (!address) return;
    saveBookingDraft(listing.id, address, {
      formValues: scheduleData || undefined,
      readCompleted: isReadCompleted,
      readTermsHash,
      acknowledgements,
      currentStep: activeStep,
    });
  }, [listing.id, address, scheduleData, isReadCompleted, readTermsHash, acknowledgements, activeStep]);

  // Move focus to step heading on step change
  const changeStep = useCallback((newStep: number) => {
    setActiveStep(newStep);
    setTimeout(() => {
      stepHeadingRef.current?.focus();
    }, 50);
  }, []);

  // Demo Preset / Skip handler for 5-minute hackathon pitch
  const handleDemoPreset = () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const windowStartSec = nowSec + 3600;
    const windowEndSec = nowSec + 5400;
    const deadlineSec = nowSec + 1800;
    const currentWallet = (address || "0x0000000000000000000000000000000000000000") as `0x${string}`;

    const presetSchedule: ScheduleFormData = {
      bookingId: generateBookingId(),
      wallet: currentWallet,
      buyerType: "Autonomous Agent",
      isAgent: true,
      legalName: "DSRM Autonomous Research Agent",
      country: "US",
      email: "agent@dsrm.network",
      principalName: "Autonomous Space Research Lab",
      principalAddress: "77 Innovation Way, Palo Alto, CA 94301",
      targetRegion: "Global Ground Stations (LEO Uplink)",
      frequencyBand: "Ku/Ka-Band",
      minElevation: "15 degrees",
      dataVolume: "25 GB nominal",
      latencyTarget: "< 45 ms RTT",
      intendedUseCategory: "Scientific research and education",
      otherDescription: "",
      windowStart: windowStartSec,
      windowEnd: windowEndSec,
      signatureDeadline: deadlineSec,
      amountWei: listingPriceWei,
    };

    setScheduleData(presetSchedule);
    setIsReadCompleted(true);
    setReadTermsHash(parsedTerms.termsHash);

    const nowIso = new Date().toISOString();
    const presetAcks: Record<string, StoredAcknowledgement> = {
      C1: { ticked: true, timestamp: nowIso },
      C2: { ticked: true, timestamp: nowIso },
      C3: { ticked: true, timestamp: nowIso },
      C4: { ticked: true, timestamp: nowIso },
      C5: { ticked: true, timestamp: nowIso },
      C6: { ticked: true, timestamp: nowIso },
      C7: { ticked: true, timestamp: nowIso },
      C8: { ticked: true, timestamp: nowIso },
      C9: { ticked: true, timestamp: nowIso },
      C10: { ticked: true, timestamp: nowIso },
    };
    setAcknowledgements(presetAcks);
    changeStep(4);
    toast.success("Demo preset loaded: Ready for EIP-712 sign & escrow deposit");
  };

  // Step 1 validation completion
  const handleScheduleSubmit = (data: ScheduleFormData) => {
    // If buyer type changed from agent to non-agent, drop C10 acknowledgement
    if (scheduleData && scheduleData.isAgent !== data.isAgent) {
      if (!data.isAgent && acknowledgements.C10) {
        const copy = { ...acknowledgements };
        delete copy.C10;
        setAcknowledgements(copy);
      }
    }
    setScheduleData(data);
    changeStep(2);
  };

  // Step 1 value change invalidation
  const handleScheduleValuesChanged = () => {
    // Editing Step 1 invalidates Step 4 signature
  };

  // Step 2 read completion
  const handleReadCompleted = (hash: string) => {
    setIsReadCompleted(true);
    setReadTermsHash(hash);
  };

  // Step 3 acknowledgement toggle
  const handleToggleAcknowledgement = (id: string, ticked: boolean) => {
    setAcknowledgements((prev) => ({
      ...prev,
      [id]: {
        ticked,
        timestamp: new Date().toISOString(),
      },
    }));
  };

  // Step 4 success callback
  const handleBookingSuccess = (bookingRef: string, txHash: string) => {
    setCompletedBooking({ bookingRef, txHash });
    if (address) {
      clearBookingDraft(listing.id, address);
    }
  };

  const isWrongChain = isConnected && chainId !== SEPOLIA_CHAIN_ID;
  const isAgent = Boolean(scheduleData?.isAgent);

  // Check step unlock conditions
  const isStep1Complete = Boolean(scheduleData);
  const isStep2Complete = isReadCompleted && readTermsHash === parsedTerms.termsHash;
  const isStep3Complete = Boolean(
    acknowledgements.C1?.ticked &&
    acknowledgements.C2?.ticked &&
    acknowledgements.C3?.ticked &&
    acknowledgements.C4?.ticked &&
    acknowledgements.C5?.ticked &&
    acknowledgements.C6?.ticked &&
    acknowledgements.C7?.ticked &&
    acknowledgements.C8?.ticked &&
    acknowledgements.C9?.ticked &&
    (!isAgent || acknowledgements.C10?.ticked)
  );

  return (
    <div className="w-full space-y-6">
      {/* Top Header Bar with Back Button & Skip/Demo Preset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/marketplace")}
              className="text-xs font-mono text-white/60 hover:text-white hover:bg-white/[0.05] h-8 px-2.5 -ml-2.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Marketplace</span>
            </Button>
            <span className="text-white/20">|</span>
            <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
              Pre-Payment Agreement
            </span>
            <Badge variant="outline" className="font-mono text-[10px] text-white/80 border-white/20 bg-white/[0.03]">
              Template v1.0
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white mt-1">
            Book Satellite Pass: {listing.name}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDemoPreset}
            className="text-xs font-mono bg-white/[0.04] border-white/20 text-white hover:bg-white/10 hover:border-white/40 h-8 px-3"
            title="Auto-fill verified parameters and skip directly to payment"
          >
            <FastForward className="w-3.5 h-3.5 mr-1.5" />
            <span>Skip (Demo Preset)</span>
          </Button>
          <ConnectButton />
        </div>
      </div>

      {/* Wallet Connection Gate Blocking Alert */}
      {!isConnected && (
        <Alert variant="destructive" className="border-white/20 bg-white/[0.02]">
          <AlertTriangle className="h-4 w-4 text-white" />
          <AlertTitle className="text-xs font-mono text-white">Wallet Connection Required</AlertTitle>
          <AlertDescription className="text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1 font-sans text-white/70">
            <span>
              A connected Ethereum Web3 wallet is required to generate EIP-712 pre-payment booking agreements and execute escrow deposits on Sepolia.
            </span>
            <div className="shrink-0">
              <ConnectButton />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Chain Gate Blocking Alert */}
      {isConnected && isWrongChain && (
        <Alert variant="destructive" className="border-white/20 bg-white/[0.02]">
          <AlertTriangle className="h-4 w-4 text-white" />
          <AlertTitle className="text-xs font-mono text-white">Wrong Network Detected</AlertTitle>
          <AlertDescription className="text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1 font-sans text-white/70">
            <span>
              Connected to Chain ID #{chainId}. The DSRM Escrow Contract and telemetry attestation
              service operate on Ethereum Sepolia (Chain ID 11155111).
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSwitchingChain}
              onClick={() => switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })}
              className="shrink-0 font-mono text-xs bg-white text-black hover:bg-white/90 border-transparent"
            >
              {isSwitchingChain ? "Switching..." : "Switch to Sepolia"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Wizard Layout: Progress Sidebar + Step Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar / Mobile Compact Top Bar */}
        <div className="lg:col-span-3 space-y-2">
          {/* Mobile Step Bar */}
          <div className="lg:hidden flex items-center justify-between p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-mono overflow-x-auto">
            {STEPS.map((s) => {
              const isActive = activeStep === s.id;
              const isPast = activeStep > s.id;
              const isLocked =
                (s.id === 2 && !isStep1Complete) ||
                (s.id === 3 && !isStep2Complete) ||
                (s.id === 4 && (!isStep2Complete || !isStep3Complete));

              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={isLocked}
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => changeStep(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-white text-black font-semibold"
                      : isPast
                      ? "text-white"
                      : isLocked
                      ? "text-white/30 cursor-not-allowed opacity-50"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="font-bold">{s.id}.</span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Stepper Sidebar */}
          <div className="hidden lg:block rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block pb-2 border-b border-white/[0.08]">
              Workflow Progress
            </span>

            <nav className="space-y-1.5" aria-label="Booking agreement progress">
              {STEPS.map((s) => {
                const isActive = activeStep === s.id;
                const isPast = activeStep > s.id;
                const isLocked =
                  (s.id === 2 && !isStep1Complete) ||
                  (s.id === 3 && !isStep2Complete) ||
                  (s.id === 4 && (!isStep2Complete || !isStep3Complete));

                const Icon = s.icon;

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isLocked}
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => changeStep(s.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-white text-black shadow-sm font-semibold"
                        : isPast
                        ? "text-white hover:bg-white/[0.04]"
                        : isLocked
                        ? "text-white/30 opacity-40 cursor-not-allowed"
                        : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-mono ${
                        isActive
                          ? "bg-black text-white font-bold"
                          : isPast
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-medium truncate flex items-center justify-between">
                        <span>{s.title}</span>
                        {isPast && <span className="text-[10px] text-white/50">Done</span>}
                      </div>
                      <div className={`text-[10px] truncate font-sans ${isActive ? "text-black/70" : "text-white/40"}`}>
                        {s.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/[0.08] text-[10px] text-white/40 font-mono space-y-1">
              <div>Terms Hash: {parsedTerms.termsHash.slice(0, 10)}...</div>
              <div>Mode: EIP-712 Standard</div>
            </div>
          </div>
        </div>

        {/* Step Content Container */}
        <div
          ref={stepHeadingRef}
          tabIndex={-1}
          className="lg:col-span-9 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 focus:outline-none"
        >
          {/* Completed State */}
          {completedBooking ? (
            <div className="space-y-6 text-center py-8 font-mono">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Booking Agreement Activated</h3>
                <p className="text-xs text-white/60 font-sans">
                  The pass has been successfully recorded in the DSRM decentralized registry and funds are locked in escrow.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40">Booking ID:</span>
                  <span className="text-white truncate max-w-[220px]">{completedBooking.bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Tx Hash:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${completedBooking.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>{completedBooking.txHash.slice(0, 10)}...</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Network:</span>
                  <span className="text-white">Ethereum Sepolia (Active)</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/my-bookings")}
                  className="text-xs font-mono border-white/20 text-white hover:bg-white/10"
                >
                  Go to My Bookings
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push("/marketplace")}
                  className="bg-white text-black hover:bg-white/90 text-xs font-mono"
                >
                  Return to Marketplace
                </Button>
              </div>
            </div>
          ) : (
            <>
              {activeStep === 1 && (
                <StepSchedule
                  listing={listing}
                  connectedWallet={(address || "") as `0x${string}`}
                  initialValues={scheduleData || undefined}
                  onValidSubmit={handleScheduleSubmit}
                  onValuesChanged={handleScheduleValuesChanged}
                />
              )}

              {activeStep === 2 && (
                <StepTerms
                  chainId={chainId}
                  isReadCompleted={isReadCompleted}
                  onReadCompleted={handleReadCompleted}
                  onContinue={() => changeStep(3)}
                />
              )}

              {activeStep === 3 && (
                <StepAcknowledgements
                  isAgent={isAgent}
                  tickedState={acknowledgements}
                  onToggleAcknowledgement={handleToggleAcknowledgement}
                  onContinue={() => changeStep(4)}
                  onBack={() => changeStep(2)}
                />
              )}

              {activeStep === 4 && scheduleData && (
                <StepSign
                  listing={listing}
                  scheduleData={scheduleData}
                  acknowledgements={acknowledgements}
                  termsVersion={parsedTerms.version}
                  termsHash={parsedTerms.termsHash}
                  chainId={chainId}
                  onBack={() => changeStep(3)}
                  onSuccess={handleBookingSuccess}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
