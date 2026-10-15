"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Layers,
  ArrowDownCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { HashBadge } from "./HashBadge";
import { TermsReader } from "./TermsReader";
import { parseAgreementTerms, ParsedTerms } from "@/lib/agreement/terms";
import { SATELLITE_ESCROW_ADDRESS } from "@/lib/contracts/satelliteEscrow";
import { RAW_AGREEMENT_MARKDOWN } from "@/content/legal/agreementText";

interface StepTermsProps {
  chainId: number;
  isReadCompleted?: boolean;
  onReadCompleted: (termsHash: string) => void;
  onContinue: () => void;
}

const KEY_TERMS_ARTICLES = [
  { num: 6, label: "Art 6: Escrow & Fees" },
  { num: 8, label: "Art 8: Settlement & Refunds" },
  { num: 10, label: "Art 10: Excused Events" },
  { num: 11, label: "Art 11: Acceptable Use" },
  { num: 15, label: "Art 15: Liability Limits" },
  { num: 18, label: "Art 18: Smart Contract Risk" },
];

export function StepTerms({
  chainId,
  isReadCompleted = false,
  onReadCompleted,
  onContinue,
}: StepTermsProps) {
  const [activeTab, setActiveTab] = useState<"accordion" | "fulltext">("accordion");
  const [openAccordionItem, setOpenAccordionItem] = useState<string>("article-1");
  const [scrolledToEnd, setScrolledToEnd] = useState<boolean>(isReadCompleted);
  const viewportRef = useRef<HTMLDivElement>(null);

  const parsedTerms: ParsedTerms = React.useMemo(() => {
    return parseAgreementTerms(RAW_AGREEMENT_MARKDOWN);
  }, []);

  const ipfsCid = process.env.NEXT_PUBLIC_TERMS_CID;
  const oracleMode = (process.env.NEXT_PUBLIC_ORACLE_MODE as "simulated" | "production") || "simulated";
  const isTestnet = chainId === 11155111 || chainId === 31337;

  // Placeholder blocking logic:
  // On testnet: non-blocking warning Alert listing count
  // On mainnet or production oracle mode: BLOCK signing
  const hasPlaceholders = parsedTerms.placeholderCount > 0;
  const isPlaceholderBlocked = hasPlaceholders && (!isTestnet || oracleMode === "production");

  const checkScrollPosition = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // Within 30px of bottom
    if (scrollHeight - scrollTop - clientHeight < 30) {
      if (!scrolledToEnd) {
        setScrolledToEnd(true);
        onReadCompleted(parsedTerms.termsHash);
      }
    }
  }, [scrolledToEnd, onReadCompleted, parsedTerms.termsHash]);

  const handleKeyTermClick = (articleNum: number) => {
    setActiveTab("accordion");
    const itemId = `article-${articleNum}`;
    setOpenAccordionItem(itemId);
    setTimeout(() => {
      const el = document.getElementById(itemId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1F2433] pb-4">
        <h2 className="text-sm font-semibold tracking-wider font-mono text-white flex items-center justify-between">
          <span>PART B: TERMS & SCHEDULES</span>
          <span className="text-[11px] text-[#9BA3B8] font-normal font-sans">
            Step 2 of 4
          </span>
        </h2>
        <p className="text-xs text-[#9BA3B8] mt-1 font-sans">
          Review the binding legal terms, performance metrics, and settlement rules for satellite pass execution.
        </p>
      </div>

      {/* Metadata Badges Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[#1F2433] bg-[#0c0e17] text-xs">
        <HashBadge label="Terms Hash" value={parsedTerms.termsHash} truncateLength={8} />

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#9BA3B8]">IPFS CID:</span>
          {ipfsCid ? (
            <HashBadge value={ipfsCid} truncateLength={8} />
          ) : (
            <Badge variant="secondary" className="font-mono text-[10px] text-[#9BA3B8] border-[#1F2433]">
              Not pinned
            </Badge>
          )}
        </div>

        <HashBadge
          label="Escrow Contract"
          value={SATELLITE_ESCROW_ADDRESS}
          truncateLength={6}
        />

        <HashBadge
          label="Chain"
          value={`Sepolia (${chainId})`}
          truncateLength={16}
          copyable
          className="ml-auto"
        />
      </div>

      {/* Mandatory Alerts */}
      <div className="space-y-3">
        {/* Article 6.5 Testnet Notice */}
        {isTestnet && (
          <Alert variant="info" className="py-2.5">
            <FileText className="h-4 w-4" />
            <AlertTitle className="text-xs font-mono">Article 6.5 Testnet Notice</AlertTitle>
            <AlertDescription className="text-xs font-sans">
              This deployment is running on the Ethereum Sepolia Testnet. All deposits utilize testnet
              Sepolia ETH with no real commercial value. Attestations and oracle telemetry simulate pass execution.
            </AlertDescription>
          </Alert>
        )}

        {/* Article 18 Risk Alert (Always Visible) */}
        <Alert variant="warning" className="py-2.5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-mono">Article 18 Blockchain & Smart Contract Risks</AlertTitle>
          <AlertDescription className="text-xs font-sans">
            Transactions on public blockchains are irreversible. Settlement, slashing, and fund release
            are governed deterministically by smart contract logic and oracle attestations. Read Article 18
            for full disclosures.
          </AlertDescription>
        </Alert>

        {/* Unresolved Placeholders Detection */}
        {hasPlaceholders && (
          <Alert variant={isPlaceholderBlocked ? "destructive" : "warning"} className="py-2.5">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle className="text-xs font-mono">
              {isPlaceholderBlocked ? "Blocked: Template Placeholders Detected" : "Template Notice: Unresolved Placeholders"}
            </AlertTitle>
            <AlertDescription className="text-xs font-sans">
              The agreement template contains {parsedTerms.placeholderCount} bracketed placeholders (e.g. legal entity name, IPFS CID).
              {isPlaceholderBlocked
                ? " Signing is blocked on mainnet or production oracle mode until all legal variables are resolved."
                : " Operating in testnet simulation mode: non-blocking warning enabled for testing."}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Key Terms Chips Row */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-[#9BA3B8] uppercase tracking-wider block">
          Key Terms Navigation:
        </span>
        <div className="flex flex-wrap gap-2">
          {KEY_TERMS_ARTICLES.map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => handleKeyTermClick(item.num)}
              className="py-1 px-2.5 rounded-md border border-[#1F2433] bg-[#11131c] hover:bg-white/[0.06] hover:border-[#384259] text-[11px] font-mono text-[#F0F3F8] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle: Accordion vs Full Text */}
      <div className="flex items-center justify-between border-b border-[#1F2433] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("accordion")}
            className={`py-1 px-3 rounded-md text-xs font-mono transition-colors ${
              activeTab === "accordion"
                ? "bg-[#1d1f29] text-white border border-[#384259]"
                : "text-[#9BA3B8] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Section View ({parsedTerms.articles.length} Articles, {parsedTerms.schedules.length} Schedules)</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fulltext")}
            className={`py-1 px-3 rounded-md text-xs font-mono transition-colors ${
              activeTab === "fulltext"
                ? "bg-[#1d1f29] text-white border border-[#384259]"
                : "text-[#9BA3B8] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Read Full Document (Required to Unlock Step 3)</span>
            </span>
          </button>
        </div>

        {scrolledToEnd ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Document Read Completed</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-300 font-mono">
            <ArrowDownCircle className="h-3.5 w-3.5 animate-pulse" />
            <span>Scroll full text to bottom to proceed</span>
          </span>
        )}
      </div>

      {/* View 1: Accordion View */}
      {activeTab === "accordion" && (
        <div className="space-y-4">
          <Accordion
            type="single"
            collapsible
            value={openAccordionItem}
            onValueChange={setOpenAccordionItem}
            className="w-full space-y-2"
          >
            {/* Articles */}
            <div className="border border-[#1F2433] rounded-xl p-3 bg-[#11131c]">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block mb-2">
                Part B: Articles (1 — 20)
              </span>
              {parsedTerms.articles.map((art) => (
                <AccordionItem key={art.id} value={art.id} id={art.id}>
                  <AccordionTrigger className="text-left py-2.5">
                    <span>{art.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3">
                    <TermsReader content={art.body} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>

            {/* Schedules */}
            <div className="border border-[#1F2433] rounded-xl p-3 bg-[#11131c]">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block mb-2">
                Schedules (A — F)
              </span>
              {parsedTerms.schedules.map((sch) => (
                <AccordionItem key={sch.id} value={sch.id} id={sch.id}>
                  <AccordionTrigger className="text-left py-2.5">
                    <span>{sch.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3">
                    <TermsReader content={sch.body} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          </Accordion>
        </div>
      )}

      {/* View 2: Read Full Text ScrollArea tracking scroll-to-bottom */}
      {activeTab === "fulltext" && (
        <div className="space-y-2">
          <div className="rounded-xl border border-[#1F2433] bg-[#0c0e17] overflow-hidden">
            <ScrollArea
              className="h-[520px] p-6 text-xs text-[#9BA3B8]"
              viewportRef={viewportRef}
              onScrollCapture={checkScrollPosition}
            >
              <div className="space-y-4 max-w-4xl mx-auto">
                <TermsReader content={parsedTerms.rawText} />
                <div className="pt-8 pb-4 text-center border-t border-[#1F2433]">
                  <p className="font-mono text-xs text-emerald-400 font-semibold">
                    --- END OF AGREEMENT DOCUMENT (HASH: {parsedTerms.termsHash.slice(0, 14)}...) ---
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setScrolledToEnd(true);
                      onReadCompleted(parsedTerms.termsHash);
                    }}
                    className="mt-3 text-xs font-mono"
                  >
                    Confirm Read to End
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1F2433]">
        <span className="text-xs text-[#5A6275] font-sans">
          {scrolledToEnd
            ? "Step 3 is unlocked."
            : "Reviewing the complete document text is required before proceeding to acknowledgements."}
        </span>

        <Button
          type="button"
          onClick={onContinue}
          disabled={!scrolledToEnd || isPlaceholderBlocked}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs disabled:opacity-40"
        >
          Proceed to Acknowledgements
        </Button>
      </div>
    </div>
  );
}
