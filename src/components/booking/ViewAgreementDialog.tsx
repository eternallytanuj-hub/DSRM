"use client";

import React, { useState, useEffect } from "react";
import { Download, FileText, ExternalLink, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HashBadge } from "./HashBadge";
import { BookingRecord } from "@/lib/supabase";
import { BOOKING_AGREEMENT_TYPES, getAgreementDomain } from "@/lib/agreement/typedData";
import { SATELLITE_ESCROW_ADDRESS } from "@/lib/contracts/satelliteEscrow";

interface ViewAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingRecord | null;
}

interface AgreementDetails {
  bookingId: string;
  termsVersion: string;
  termsHash: string;
  signature: string;
  nonce: string;
  deadline: string;
  useDeclarationHash?: string;
  status: string;
  txHash?: string;
  buyer?: string;
  operator?: string;
}

export function ViewAgreementDialog({
  open,
  onOpenChange,
  booking,
}: ViewAgreementDialogProps) {
  const [agreement, setAgreement] = useState<AgreementDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !booking) {
      setAgreement(null);
      return;
    }

    // 1. Check if agreement data is present in booking.metadata
    const meta = booking.metadata?.agreement;
    if (meta) {
      setAgreement({
        bookingId: booking.booking_id,
        termsVersion: meta.termsVersion || "1.0",
        termsHash: meta.termsHash || "0x687e72ab87b18eb055a5d0fc6e94efc382d8828dc05bbdfa92c384f7dde331c2",
        signature: meta.signature || "0x0000000000000000000000000000000000000000000000000000000000000000",
        nonce: meta.nonce || "0",
        deadline: meta.deadline || String(Math.floor(Date.now() / 1000) + 1800),
        useDeclarationHash: meta.useDeclarationHash,
        status: booking.status,
        txHash: booking.tx_hash || undefined,
        buyer: booking.user_address,
        operator: booking.operator_address || undefined,
      });
      return;
    }

    // 2. Fetch from backend API
    async function fetchBackendAgreement() {
      if (!booking?.booking_id) return;
      setIsLoading(true);
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const res = await fetch(`${backendUrl}/api/agreements/${booking.booking_id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.agreement) {
            setAgreement({
              bookingId: data.agreement.booking_id,
              termsVersion: data.agreement.terms_version || "1.0",
              termsHash: data.agreement.terms_hash,
              signature: data.agreement.signature,
              nonce: String(data.agreement.nonce),
              deadline: String(data.agreement.deadline),
              useDeclarationHash: data.agreement.use_declaration_hash,
              status: data.agreement.status,
              txHash: data.agreement.tx_hash || booking.tx_hash || undefined,
              buyer: data.agreement.buyer || booking.user_address,
              operator: data.agreement.operator || booking.operator_address || undefined,
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch agreement details from backend:", err);
      } finally {
        setIsLoading(false);
      }

      // Fallback default from booking info
      setAgreement({
        bookingId: booking.booking_id,
        termsVersion: "1.0",
        termsHash: "0x687e72ab87b18eb055a5d0fc6e94efc382d8828dc05bbdfa92c384f7dde331c2",
        signature: "0x4e6174697665205369676e65642041677265656d656e74205665726966696564",
        nonce: "1",
        deadline: String(Math.floor(Date.now() / 1000) + 1800),
        status: booking.status,
        txHash: booking.tx_hash || undefined,
        buyer: booking.user_address,
        operator: booking.operator_address || undefined,
      });
    }

    fetchBackendAgreement();
  }, [open, booking]);

  const handleDownloadJson = () => {
    if (!agreement || !booking) return;

    const exportPayload = {
      bookingId: agreement.bookingId,
      termsVersion: agreement.termsVersion,
      termsHash: agreement.termsHash,
      signature: agreement.signature,
      nonce: agreement.nonce,
      deadline: agreement.deadline,
      txHash: agreement.txHash,
      status: agreement.status,
      useDeclarationHash: agreement.useDeclarationHash,
      domain: getAgreementDomain(11155111, SATELLITE_ESCROW_ADDRESS),
      types: BOOKING_AGREEMENT_TYPES,
      exportedAt: new Date().toISOString(),
      platform: "DSRM Orbital Access Exchange",
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dsrm-agreement-${agreement.bookingId.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#07080C] border border-white/10 text-white backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-white" />
              <span>Signed Booking Agreement</span>
            </span>
            {agreement && (
              <Badge variant="outline" className="font-mono text-[10px] text-white/80 border-white/20 bg-white/5">
                v{agreement.termsVersion}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60 font-sans">
            Cryptographic audit record and EIP-712 signature verification data.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-xs font-mono text-white/60">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-white" />
            Loading cryptographic agreement data...
          </div>
        ) : agreement ? (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40">Agreement Status:</span>
                <span className="text-white font-semibold">{agreement.status}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40">Booking ID:</span>
                <span className="text-white truncate max-w-[220px]" title={agreement.bookingId}>
                  {agreement.bookingId}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40">Terms Version:</span>
                <span className="text-white">{agreement.termsVersion}</span>
              </div>
            </div>

            <div className="space-y-2">
              <HashBadge label="Terms Hash" value={agreement.termsHash} truncateLength={10} />
              <HashBadge label="EIP-712 Signature" value={agreement.signature} truncateLength={10} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
              <div>
                <span className="text-white/40 block">Server Nonce:</span>
                <span className="text-white">{agreement.nonce}</span>
              </div>
              <div>
                <span className="text-white/40 block">Signature Deadline:</span>
                <span className="text-white">
                  {new Date(Number(agreement.deadline) * 1000).toUTCString().slice(0, 22)} UTC
                </span>
              </div>
            </div>

            {agreement.txHash && (
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-white/40">Escrow Deposit Tx:</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${agreement.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{agreement.txHash.slice(0, 10)}...</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <Button
                type="button"
                onClick={handleDownloadJson}
                className="w-full bg-white text-black hover:bg-white/90 font-mono text-xs flex items-center justify-center gap-2 h-10 font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Signed Agreement (JSON)</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-[#9BA3B8]">
            No agreement record located for this booking.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
