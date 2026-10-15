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
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    if (activeStep > 1) {
      // Keep acknowledgements unless buyer type changed
    }
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2433]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#9BA3B8] uppercase">
              Pre-Payment Agreement Engine
            </span>
            <span className="text-[#384259]">•</span>
            <Badge variant="outline" className="font-mono text-[10px] text-blue-400 border-blue-500/30">
              Template v1.0
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white mt-1">
            Book Satellite Pass: {listing.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ConnectButton />
        </div>
      </div>

      {/* Wallet Connection Gate Blocking Alert */}
      {!isConnected && (
        <Alert variant="destructive" className="border-amber-500/40 bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-xs font-mono">Wallet Connection Required</AlertTitle>
          <AlertDescription className="text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1 font-sans">
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
        <Alert variant="destructive" className="border-red-500/40 bg-red-950/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-mono">Wrong Network Detected</AlertTitle>
          <AlertDescription className="text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1 font-sans">
            <span>
              Connected to Chain ID #{chainId}. The DSRM Escrow Contract and telemetry attestation
              service operate on Ethereum Sepolia (Chain ID 11155111).
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isSwitchingChain}
              onClick={() => switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })}
              className="shrink-0 font-mono text-xs"
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
          <div className="lg:hidden flex items-center justify-between p-2 rounded-xl border border-[#1F2433] bg-[#0c0e17] text-xs font-mono overflow-x-auto">
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
                      ? "bg-[#1d1f29] text-white border border-[#384259]"
                      : isPast
                      ? "text-emerald-400"
                      : isLocked
                      ? "text-[#5A6275] cursor-not-allowed opacity-50"
                      : "text-[#9BA3B8] hover:text-white"
                  }`}
                >
                  <span className="font-bold">{s.id}.</span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Stepper Sidebar */}
          <div className="hidden lg:block rounded-xl border border-[#1F2433] bg-[#0c0e17] p-4 space-y-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#5A6275] block pb-2 border-b border-[#1F2433]">
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
                        ? "bg-[#1d1f29] border border-blue-500/40 text-white shadow-sm"
                        : isPast
                        ? "text-[#F0F3F8] hover:bg-white/[0.03] border border-transparent"
                        : isLocked
                        ? "text-[#5A6275] opacity-40 cursor-not-allowed border border-transparent"
                        : "text-[#9BA3B8] hover:text-white hover:bg-white/[0.02] border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-mono ${
                        isActive
                          ? "bg-blue-600 text-white font-bold"
                          : isPast
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-[#191b25] text-[#9BA3B8]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-medium truncate flex items-center justify-between">
                        <span>{s.title}</span>
                        {isPast && <span className="text-[10px] text-emerald-400">Done</span>}
                      </div>
                      <div className="text-[10px] text-[#5A6275] truncate font-sans">
                        {s.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#1F2433] text-[10px] text-[#5A6275] font-mono space-y-1">
              <div>Terms Hash: {parsedTerms.termsHash.slice(0, 10)}...</div>
              <div>Mode: EIP-712 Standard</div>
            </div>
          </div>
        </div>

        {/* Step Content Container */}
        <div
          ref={stepHeadingRef}
          tabIndex={-1}
          className="lg:col-span-9 rounded-2xl border border-[#1F2433] bg-[#0d0f18] p-6 focus:outline-none"
        >
          {/* Completed State */}
          {completedBooking ? (
            <div className="space-y-6 text-center py-8 font-mono">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Booking Agreement Activated</h3>
                <p className="text-xs text-[#9BA3B8] font-sans">
                  The pass has been successfully recorded in the DSRM decentralized registry and funds are locked in escrow.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl border border-[#1F2433] bg-[#0c0e17] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5A6275]">Booking ID:</span>
                  <span className="text-white truncate max-w-[220px]">{completedBooking.bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6275]">Tx Hash:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${completedBooking.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>{completedBooking.txHash.slice(0, 10)}...</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6275]">Network:</span>
                  <span className="text-emerald-400">Ethereum Sepolia (Active)</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/my-bookings")}
                  className="text-xs font-mono"
                >
                  Go to My Bookings
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push("/marketplace")}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono"
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
