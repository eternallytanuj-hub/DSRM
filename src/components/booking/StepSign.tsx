"use client";

import React, { useState, useEffect } from "react";
import { formatEther } from "viem";
import { ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AgreementSummary } from "./AgreementSummary";
import { SignDialog } from "./SignDialog";
import { ScheduleFormData } from "@/lib/agreement/schema";
import { StoredAcknowledgement } from "@/lib/agreement/state";
import { SatellitePass } from "@/app/(stitch)/marketplace/types";

interface StepSignProps {
  listing: SatellitePass;
  scheduleData: ScheduleFormData;
  acknowledgements: Record<string, StoredAcknowledgement>;
  termsVersion: string;
  termsHash: `0x${string}`;
  chainId: number;
  onBack: () => void;
  onSuccess: (bookingRef: string, txHash: string) => void;
}

export function StepSign({
  listing,
  scheduleData,
  acknowledgements,
  termsVersion,
  termsHash,
  chainId,
  onBack,
  onSuccess,
}: StepSignProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCheckingResume, setIsCheckingResume] = useState(false);
  const [resumedAgreement, setResumedAgreement] = useState<{
    signature: `0x${string}`;
    nonce: bigint;
    deadline: bigint;
  } | null>(null);

  const amountEth = React.useMemo(() => {
    try {
      return formatEther(BigInt(scheduleData.amountWei));
    } catch {
      return "0.0001";
    }
  }, [scheduleData.amountWei]);

  const operatorAddress = (listing.operatorAddress ||
    "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176") as `0x${string}`;

  // Check backend for existing unexpired, undeposited agreement
  useEffect(() => {
    let isCancelled = false;

    async function checkResume() {
      if (!scheduleData.bookingId) return;
      setIsCheckingResume(true);
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const res = await fetch(
          `${backendUrl}/api/agreements/${scheduleData.bookingId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (
            data.agreement &&
            data.agreement.status === "VERIFIED" &&
            data.agreement.signature &&
            Number(data.agreement.deadline) > Math.floor(Date.now() / 1000)
          ) {
            if (!isCancelled) {
              setResumedAgreement({
                signature: data.agreement.signature,
                nonce: BigInt(data.agreement.nonce),
                deadline: BigInt(data.agreement.deadline),
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not check agreement resume status:", err);
      } finally {
        if (!isCancelled) setIsCheckingResume(false);
      }
    }

    checkResume();
    return () => {
      isCancelled = true;
    };
  }, [scheduleData.bookingId]);

  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-4">
        <h2 className="text-sm font-semibold tracking-wider font-mono text-white flex items-center justify-between">
          <span>PART D: SIGN & ESCROW DEPOSIT</span>
          <span className="text-[11px] text-white/50 font-normal font-sans">
            Step 4 of 4
          </span>
        </h2>
        <p className="text-xs text-white/50 mt-1 font-sans">
          Review the complete booking summary and execute the cryptographic agreement signature
          followed by the Sepolia escrow deposit.
        </p>
      </div>

      {/* Resumed Agreement Alert */}
      {resumedAgreement && (
        <Alert variant="info" className="border-white/20 bg-white/[0.03]">
          <ShieldCheck className="h-4 w-4 text-white" />
          <AlertTitle className="text-xs font-mono text-white">
            Active Agreement Restored
          </AlertTitle>
          <AlertDescription className="text-xs font-sans text-white/60">
            A verified, unexpired agreement signature was located for this booking. You can resume
            directly at the escrow deposit step without re-signing.
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Summary Card */}
      <AgreementSummary
        satelliteName={listing.name}
        operatorName={listing.operator}
        noradId={listing.noradId}
        windowStart={scheduleData.windowStart}
        windowEnd={scheduleData.windowEnd}
        amountWei={scheduleData.amountWei}
        amountEth={amountEth}
        termsVersion={termsVersion}
        termsHash={termsHash}
        chainId={chainId}
      />

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-4 py-2 text-xs font-mono flex items-center gap-2 border-white/20 text-white hover:bg-white/[0.06] rounded-xl"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Acknowledgements</span>
        </Button>

        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={isCheckingResume}
          className="px-6 py-2.5 bg-white text-black hover:bg-white/90 font-mono text-xs font-medium rounded-xl flex items-center gap-2 transition-colors"
        >
          {isCheckingResume ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Verifying Session...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sign & Book Pass</span>
            </>
          )}
        </Button>
      </div>

      {/* Signing Modal (Dialog on desktop, Drawer on mobile) */}
      <SignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        scheduleData={scheduleData}
        acknowledgements={acknowledgements}
        termsVersion={termsVersion}
        termsHash={termsHash}
        satelliteName={listing.name}
        operatorAddress={operatorAddress}
        initialResumeState={resumedAgreement}
        onSuccess={onSuccess}
      />
    </div>
  );
}
