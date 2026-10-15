"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Wallet,
  ArrowRight,
  Code2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookingAgreementMessage,
  BOOKING_AGREEMENT_TYPES,
  getAgreementDomain,
  formatMessageForDisplay,
} from "@/lib/agreement/typedData";
import {
  SATELLITE_ESCROW_ADDRESS,
  DEPOSIT_ESCROW_LEGACY_ABI,
} from "@/lib/contracts/satelliteEscrow";
import {
  ESCROW_AGREEMENT_MODE,
  PROPOSED_ESCROW_AGREEMENT_ABI,
} from "@/lib/contracts/escrowAgreement";
import {
  useAccount,
  useChainId,
  useSignTypedData,
  useWriteContract,
  useConfig,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { ScheduleFormData } from "@/lib/agreement/schema";
import { StoredAcknowledgement } from "@/lib/agreement/state";
import { computeUseDeclarationHash } from "@/lib/agreement/hashes";

export type WizardSignState =
  | "idle"
  | "preparing"
  | "awaiting_signature"
  | "verifying"
  | "ready_to_deposit"
  | "awaiting_wallet_tx"
  | "confirming"
  | "saving"
  | "done"
  | "error";

interface SignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleData: ScheduleFormData;
  acknowledgements: Record<string, StoredAcknowledgement>;
  termsVersion: string;
  termsHash: `0x${string}`;
  satelliteName: string;
  operatorAddress: `0x${string}`;
  initialResumeState?: {
    signature: `0x${string}`;
    nonce: bigint;
    deadline: bigint;
  } | null;
  onSuccess: (bookingRef: string, txHash: string) => void;
}

export function SignDialog({
  open,
  onOpenChange,
  scheduleData,
  acknowledgements,
  termsVersion,
  termsHash,
  satelliteName,
  operatorAddress,
  initialResumeState,
  onSuccess,
}: SignDialogProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const wagmiConfig = useConfig();
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<WizardSignState>("idle");
  const [nonce, setNonce] = useState<bigint | null>(
    initialResumeState?.nonce ?? null
  );
  const [deadline, setDeadline] = useState<bigint | null>(
    initialResumeState?.deadline ?? null
  );
  const [signature, setSignature] = useState<`0x${string}` | null>(
    initialResumeState?.signature ?? null
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Compute useDeclarationHash
  const useDeclarationHash = React.useMemo(() => {
    return computeUseDeclarationHash({
      category: scheduleData.intendedUseCategory,
      otherDescription: scheduleData.otherDescription,
      targetRegion: scheduleData.targetRegion,
      declarationVersion: "1.0",
    });
  }, [
    scheduleData.intendedUseCategory,
    scheduleData.otherDescription,
    scheduleData.targetRegion,
  ]);

  // Construct message for typed data preview
  const typedDataMessage: BookingAgreementMessage | null = React.useMemo(() => {
    if (!address) return null;
    return {
      bookingId: scheduleData.bookingId as `0x${string}`,
      buyer: address as `0x${string}`,
      operator: operatorAddress,
      windowStart: BigInt(scheduleData.windowStart),
      windowEnd: BigInt(scheduleData.windowEnd),
      amountWei: BigInt(scheduleData.amountWei),
      termsHash,
      useDeclarationHash,
      nonce: nonce ?? BigInt(0),
      deadline: deadline ?? BigInt(scheduleData.signatureDeadline),
    };
  }, [
    address,
    scheduleData.bookingId,
    scheduleData.windowStart,
    scheduleData.windowEnd,
    scheduleData.amountWei,
    scheduleData.signatureDeadline,
    operatorAddress,
    termsHash,
    useDeclarationHash,
    nonce,
    deadline,
  ]);

  // If resumed with pre-verified state
  useEffect(() => {
    if (initialResumeState && initialResumeState.signature) {
      setSignature(initialResumeState.signature);
      setNonce(initialResumeState.nonce);
      setDeadline(initialResumeState.deadline);
      setState("ready_to_deposit");
    }
  }, [initialResumeState]);

  // Step 1: Request Server Nonce and Sign EIP-712 Message
  const handleStartSigning = async () => {
    if (!address) return;
    setErrorMessage(null);
    setState("preparing");

    try {
      // 1. Prepare on backend: fetch server-authoritative nonce & deadline
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const prepRes = await fetch(`${backendUrl}/api/agreements/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: satelliteName,
          buyerAddress: address,
          country: scheduleData.country,
          termsHash,
          windowStart: scheduleData.windowStart,
          windowEnd: scheduleData.windowEnd,
        }),
      });

      if (!prepRes.ok) {
        const errJson = await prepRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to prepare agreement on server");
      }

      const prepData = await prepRes.json();
      const serverNonce = BigInt(prepData.nonce);
      const serverDeadline = BigInt(prepData.deadline);

      setNonce(serverNonce);
      setDeadline(serverDeadline);

      if (prepData.termsHash && prepData.termsHash.toLowerCase() === termsHash.toLowerCase()) {
        toast.success("Terms hash matches authoritative version");
      }

      // 2. Prompt MetaMask EIP-712 Signature
      setState("awaiting_signature");
      toast.info("Signature requested: Please sign the agreement in your wallet");

      const domain = getAgreementDomain(chainId, SATELLITE_ESCROW_ADDRESS);
      const messageToSign = {
        bookingId: scheduleData.bookingId as `0x${string}`,
        buyer: address,
        operator: operatorAddress,
        windowStart: BigInt(scheduleData.windowStart),
        windowEnd: BigInt(scheduleData.windowEnd),
        amountWei: BigInt(scheduleData.amountWei),
        termsHash,
        useDeclarationHash,
        nonce: serverNonce,
        deadline: serverDeadline,
      };

      const sig = await signTypedDataAsync({
        domain,
        types: BOOKING_AGREEMENT_TYPES,
        primaryType: "BookingAgreement",
        message: messageToSign,
      });

      setSignature(sig);

      // 3. Verify on server
      setState("verifying");
      toast.loading("Verifying signature and registering agreement...", { id: "verify-toast" });

      const verifyRes = await fetch(`${backendUrl}/api/agreements/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: satelliteName,
          bookingId: scheduleData.bookingId,
          buyer: address,
          operator: operatorAddress,
          windowStart: scheduleData.windowStart,
          windowEnd: scheduleData.windowEnd,
          amountWei: scheduleData.amountWei,
          termsHash,
          termsVersion,
          useDeclarationHash,
          nonce: serverNonce.toString(),
          deadline: serverDeadline.toString(),
          signature: sig,
          acknowledgements,
          pii: {
            legalName: scheduleData.legalName,
            email: scheduleData.email,
            country: scheduleData.country,
            principalName: scheduleData.principalName,
            principalAddress: scheduleData.principalAddress,
          },
        }),
      });

      toast.dismiss("verify-toast");

      if (!verifyRes.ok) {
        const verifyErr = await verifyRes.json().catch(() => ({}));
        throw new Error(verifyErr.error || "Server verification failed");
      }

      toast.success("Signature verified by server");
      setState("ready_to_deposit");
    } catch (err: unknown) {
      toast.dismiss("verify-toast");
      const errObj = err as { name?: string; message?: string; code?: number };
      if (errObj?.name === "UserRejectedRequestError" || errObj?.code === 4001) {
        toast("Signature request cancelled by user.");
        setState("idle");
        return;
      }
      setErrorMessage(errObj?.message || "Failed to complete agreement signing");
      setState("error");
    }
  };

  // Step 2: Escrow Smart Contract Deposit
  const handleDepositEscrow = async () => {
    if (!address || !signature || nonce === null || deadline === null) return;
    setErrorMessage(null);
    setState("awaiting_wallet_tx");
    toast.info("Escrow Deposit requested: Please approve the transaction in wallet");

    try {
      let hash: `0x${string}`;

      if (ESCROW_AGREEMENT_MODE === "v2") {
        // v2 mode: on-chain agreement verification
        hash = await writeContractAsync({
          chainId,
          address: SATELLITE_ESCROW_ADDRESS,
          abi: PROPOSED_ESCROW_AGREEMENT_ABI,
          functionName: "depositEscrowWithAgreement",
          args: [
            scheduleData.bookingId as `0x${string}`,
            operatorAddress,
            BigInt(scheduleData.windowStart),
            BigInt(scheduleData.windowEnd),
            termsHash,
            useDeclarationHash,
            nonce,
            deadline,
            signature,
          ],
          value: BigInt(scheduleData.amountWei),
        });
      } else {
        // legacy mode: standard depositEscrow call
        hash = await writeContractAsync({
          chainId,
          address: SATELLITE_ESCROW_ADDRESS,
          abi: DEPOSIT_ESCROW_LEGACY_ABI,
          functionName: "depositEscrow",
          args: [
            scheduleData.bookingId as `0x${string}`,
            operatorAddress,
            BigInt(scheduleData.windowStart),
            BigInt(scheduleData.windowEnd),
            satelliteName,
          ],
          value: BigInt(scheduleData.amountWei),
        });
      }

      setTxHash(hash);
      setState("confirming");
      toast.info(`Transaction submitted: ${hash.slice(0, 10)}...`, {
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${hash}`, "_blank"),
        },
      });

      // 4. Wait for on-chain block receipt
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        timeout: 60000,
      });

      const minedBlock = Number(receipt.blockNumber);
      setBlockNumber(minedBlock);
      toast.success(`Confirmed in block #${minedBlock}`);

      // 5. Notify server to confirm and activate
      setState("saving");
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      await fetch(`${backendUrl}/api/agreements/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: scheduleData.bookingId,
          txHash: hash,
        }),
      }).catch((e) => console.warn("Backend confirmation sync note:", e));

      setState("done");
      toast.success("Booking saved");
      onSuccess(scheduleData.bookingId, hash);
    } catch (err: unknown) {
      const errObj = err as { name?: string; message?: string; code?: number; shortMessage?: string };
      if (errObj?.name === "UserRejectedRequestError" || errObj?.code === 4001) {
        toast("Transaction cancelled by user.");
        setState("ready_to_deposit");
        return;
      }
      const decodedReason = errObj?.shortMessage || errObj?.message || "Transaction reverted or failed";
      setErrorMessage(decodedReason);
      setState("error");
    }
  };

  const isDeadlineExpired =
    deadline !== null && Number(deadline) <= Math.floor(Date.now() / 1000);

  // Content body shared between Dialog & Drawer
  const contentBody = (
    <div className="space-y-4">
      {/* 2-Step Progress Header */}
      <div className="space-y-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-white/70 flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                signature
                  ? "bg-white text-black font-bold"
                  : state === "awaiting_signature" || state === "preparing" || state === "verifying"
                  ? "bg-white/30 text-white animate-pulse"
                  : "bg-white/10 text-white/50"
              }`}
            >
              1
            </span>
            <span>1. EIP-712 Signature (Gasless)</span>
          </span>

          <span className="text-white/70 flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                state === "done"
                  ? "bg-white text-black font-bold"
                  : state === "awaiting_wallet_tx" || state === "confirming" || state === "saving"
                  ? "bg-white/30 text-white animate-pulse"
                  : "bg-white/10 text-white/50"
              }`}
            >
              2
            </span>
            <span>2. Escrow Deposit (Sepolia)</span>
          </span>
        </div>
        <Progress
          value={
            state === "done"
              ? 100
              : state === "confirming" || state === "saving"
              ? 80
              : state === "awaiting_wallet_tx"
              ? 60
              : state === "ready_to_deposit"
              ? 50
              : state === "verifying"
              ? 35
              : state === "awaiting_signature"
              ? 20
              : 5
          }
        />
      </div>

      {/* Code Preview of Typed Data */}
      {typedDataMessage && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-mono text-white/60">
            <span className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-white" />
              <span>EIP-712 Typed Data Payload (Decimal BigInts)</span>
            </span>
            <Badge variant="outline" className="text-[10px] border-white/20 text-white/70">
              No PII Included
            </Badge>
          </div>
          <pre className="max-h-40 overflow-y-auto rounded-lg border border-white/[0.08] bg-black/50 p-3 text-[11px] font-mono text-white/80 scrollbar-thin">
            {JSON.stringify(formatMessageForDisplay(typedDataMessage), null, 2)}
          </pre>
        </div>
      )}

      {/* Error / Warning Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="border-white/20 bg-white/[0.02]">
          <AlertCircle className="h-4 w-4 text-white" />
          <AlertTitle className="text-xs font-mono text-white">Execution Issue</AlertTitle>
          <AlertDescription className="text-xs font-sans text-white/70">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {isDeadlineExpired && (
        <Alert variant="warning" className="border-white/20 bg-white/[0.02]">
          <AlertCircle className="h-4 w-4 text-white" />
          <AlertTitle className="text-xs font-mono text-white">Signature Deadline Expired</AlertTitle>
          <AlertDescription className="text-xs font-sans text-white/70">
            The server-issued signature deadline has passed. Please re-sign to obtain a fresh nonce.
          </AlertDescription>
        </Alert>
      )}

      {/* Success State */}
      {state === "done" && txHash && (
        <div className="p-4 rounded-xl border border-white/20 bg-white/[0.04] space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Escrow Locked on Sepolia</span>
          </div>
          <div className="text-white/70 text-xs">
            Booking reference: <span className="text-white">{scheduleData.bookingId}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline flex items-center gap-1 font-mono"
            >
              <span>View On Etherscan</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            {blockNumber && (
              <span className="text-white/40">Block #{blockNumber}</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-end gap-2">
        {state === "done" ? (
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full bg-white text-black hover:bg-white/90 font-mono text-xs h-10"
          >
            Complete & Return
          </Button>
        ) : !signature || isDeadlineExpired ? (
          <Button
            type="button"
            onClick={handleStartSigning}
            disabled={
              state === "preparing" ||
              state === "awaiting_signature" ||
              state === "verifying"
            }
            className="w-full bg-white text-black hover:bg-white/90 font-mono text-xs flex items-center justify-center gap-2 h-10 font-semibold"
          >
            {state === "preparing" ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Issuing Server Nonce...</span>
              </>
            ) : state === "awaiting_signature" ? (
              <>
                <Wallet className="h-3.5 w-3.5 animate-pulse" />
                <span>Confirm in MetaMask Extension...</span>
              </>
            ) : state === "verifying" ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Verifying Cryptographic Digest...</span>
              </>
            ) : isDeadlineExpired ? (
              <span>Re-sign with Fresh Server Nonce</span>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Sign Agreement (Gasless Step 1)</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleDepositEscrow}
            disabled={
              state === "awaiting_wallet_tx" ||
              state === "confirming" ||
              state === "saving"
            }
            className="w-full bg-white text-black hover:bg-white/90 font-mono text-xs flex items-center justify-center gap-2 h-10 font-semibold"
          >
            {state === "awaiting_wallet_tx" ? (
              <>
                <Wallet className="h-3.5 w-3.5 animate-pulse" />
                <span>Approve Deposit in Wallet...</span>
              </>
            ) : state === "confirming" ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Waiting for Sepolia Block Inclusion...</span>
              </>
            ) : state === "saving" ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Activating Booking in Registry...</span>
              </>
            ) : (
              <>
                <span>Deposit Escrow & Activate Pass</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="p-4 bg-[#07080C] border-t border-white/10 text-white">
          <DrawerHeader className="text-left px-0 pt-0">
            <DrawerTitle className="text-sm font-mono text-white">
              EIP-712 Agreement Signing & Escrow
            </DrawerTitle>
            <DrawerDescription className="text-xs text-white/60">
              Sign gasless authorization and execute smart contract deposit.
            </DrawerDescription>
          </DrawerHeader>
          {contentBody}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#07080C] border border-white/10 text-white backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono text-white">
            EIP-712 Agreement Signing & Escrow
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60">
            Sign gasless legal authorization and deposit escrow to lock your orbital pass.
          </DialogDescription>
        </DialogHeader>
        {contentBody}
      </DialogContent>
    </Dialog>
  );
}
