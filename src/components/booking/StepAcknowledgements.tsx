"use client";

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  parsePartCAcknowledgements,
  AcknowledgementItem,
} from "@/lib/agreement/acknowledgements";
import { RAW_AGREEMENT_MARKDOWN } from "@/content/legal/agreementText";
import { StoredAcknowledgement } from "@/lib/agreement/state";

interface StepAcknowledgementsProps {
  isAgent: boolean;
  tickedState: Record<string, StoredAcknowledgement>;
  onToggleAcknowledgement: (id: string, ticked: boolean) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StepAcknowledgements({
  isAgent,
  tickedState,
  onToggleAcknowledgement,
  onContinue,
  onBack,
}: StepAcknowledgementsProps) {
  const oracleMode =
    (process.env.NEXT_PUBLIC_ORACLE_MODE as "simulated" | "production") ||
    "simulated";

  const allItems: AcknowledgementItem[] = useMemo(() => {
    return parsePartCAcknowledgements(RAW_AGREEMENT_MARKDOWN, oracleMode);
  }, [oracleMode]);

  // Filter out C10 if not an Autonomous Agent
  const visibleItems = useMemo(() => {
    return allItems.filter((item) => {
      if (item.id === "C10") {
        return isAgent;
      }
      return true;
    });
  }, [allItems, isAgent]);

  // All visible required items must be ticked
  const allTicked = useMemo(() => {
    return visibleItems.every((item) => tickedState[item.id]?.ticked === true);
  }, [visibleItems, tickedState]);

  const tickedCount = visibleItems.filter(
    (item) => tickedState[item.id]?.ticked === true
  ).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1F2433] pb-4">
        <h2 className="text-sm font-semibold tracking-wider font-mono text-white flex items-center justify-between">
          <span>PART C: BUYER MANDATORY ACKNOWLEDGEMENTS</span>
          <span className="text-[11px] text-[#9BA3B8] font-normal font-sans">
            Step 3 of 4
          </span>
        </h2>
        <p className="text-xs text-[#9BA3B8] mt-1 font-sans">
          You must individually acknowledge each statutory representation and risk disclosure below.
          Every acknowledgement is timestamped and recorded with your signed agreement.
        </p>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl border border-[#1F2433] bg-[#0c0e17] text-xs font-mono">
        <span className="text-[#9BA3B8]">
          Progress: {tickedCount} of {visibleItems.length} acknowledged
        </span>
        <Badge
          variant={allTicked ? "success" : "secondary"}
          className="font-mono text-[10px]"
        >
          {allTicked ? "All Required Boxes Ticked" : "Pending Signatures"}
        </Badge>
      </div>

      <div className="space-y-3">
        {visibleItems.map((item) => {
          const isChecked = tickedState[item.id]?.ticked === true;
          const timestamp = tickedState[item.id]?.timestamp;

          return (
            <Card
              key={item.id}
              className={`border transition-all cursor-pointer ${
                isChecked
                  ? "border-blue-500/40 bg-blue-500/[0.03]"
                  : "border-[#1F2433] bg-[#11131c] hover:border-[#384259]"
              }`}
              onClick={() => onToggleAcknowledgement(item.id, !isChecked)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <Checkbox
                  id={`ack-${item.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    onToggleAcknowledgement(item.id, checked === true)
                  }
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white">
                      {item.id}
                    </span>
                    {timestamp && (
                      <span className="text-[10px] font-mono text-[#5A6275]">
                        Ticked {new Date(timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9BA3B8] leading-relaxed font-sans">
                    {item.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#1F2433]">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-4 py-2 text-xs font-mono"
        >
          Back to Terms
        </Button>

        <Button
          type="button"
          onClick={onContinue}
          disabled={!allTicked}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs disabled:opacity-40"
        >
          Proceed to Sign & Escrow
        </Button>
      </div>
    </div>
  );
}
