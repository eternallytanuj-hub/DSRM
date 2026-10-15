"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HashBadge } from "./HashBadge";
import { SATELLITE_ESCROW_ADDRESS } from "@/lib/contracts/satelliteEscrow";
import { ESCROW_AGREEMENT_MODE } from "@/lib/contracts/escrowAgreement";

export interface AgreementSummaryProps {
  satelliteName: string;
  operatorName: string;
  noradId?: number;
  windowStart: number; // Unix seconds
  windowEnd: number;   // Unix seconds
  amountWei: string;
  amountEth: string;
  termsVersion: string;
  termsHash: string;
  chainId: number;
}

export function AgreementSummary({
  satelliteName,
  operatorName,
  noradId,
  windowStart,
  windowEnd,
  amountWei,
  amountEth,
  termsVersion,
  termsHash,
  chainId,
}: AgreementSummaryProps) {
  const startDate = new Date(windowStart * 1000);
  const endDate = new Date(windowEnd * 1000);

  const startUtc = startDate.toISOString().replace(".000Z", " UTC");
  const endUtc = endDate.toISOString().replace(".000Z", " UTC");

  return (
    <Card className="border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <CardHeader className="py-3 px-4 bg-white/[0.03] border-b border-white/[0.08] flex flex-row items-center justify-between">
        <CardTitle className="text-xs uppercase tracking-wider text-white font-mono flex items-center gap-2">
          <span>Booking & Agreement Specification</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] text-white/80 border-white/20 bg-white/[0.04]">
            Terms {termsVersion}
          </Badge>
          {ESCROW_AGREEMENT_MODE === "legacy" ? (
            <Badge variant="secondary" className="font-mono text-[10px] text-white/60 border-white/10 bg-white/[0.02]">
              Terms hash recorded off-chain
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-[10px] text-white border-white/30 bg-white/10">
              EIP-712 Contract Mode v2
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40 block text-[10px] tracking-wider uppercase font-sans">
              Orbital Target & Operator
            </span>
            <div className="text-white font-medium flex items-center gap-2 mt-0.5">
              <span>{satelliteName}</span>
              {noradId && (
                <span className="text-white/50 text-[11px]">#{noradId}</span>
              )}
            </div>
            <div className="text-white/60 text-[11px]">{operatorName}</div>
          </div>

          <div>
            <span className="text-white/40 block text-[10px] tracking-wider uppercase font-sans">
              Pass Window (UTC)
            </span>
            <div className="text-white font-medium mt-0.5">
              {startUtc.slice(11, 16)} — {endUtc.slice(11, 16)} UTC
            </div>
            <div className="text-white/60 text-[11px]">
              {startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.08]" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40 block text-[10px] tracking-wider uppercase font-sans">
              Escrow Deposit Amount
            </span>
            <div className="text-white font-semibold mt-0.5 font-mono">
              {amountEth} ETH
            </div>
            <div className="text-white/40 text-[10px]">
              ({amountWei} wei)
            </div>
          </div>

          <div>
            <span className="text-white/40 block text-[10px] tracking-wider uppercase font-sans">
              Target Network & Escrow
            </span>
            <div className="text-white/90 mt-0.5">
              Ethereum Sepolia ({chainId})
            </div>
            <div className="mt-1">
              <HashBadge
                label="Contract"
                value={SATELLITE_ESCROW_ADDRESS}
                truncateLength={6}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.08]" />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
          <HashBadge
            label="Terms Hash"
            value={termsHash}
            truncateLength={8}
          />
          <span className="text-white/40 text-[10px] font-sans">
            Cryptographically bound in EIP-712 signature
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
