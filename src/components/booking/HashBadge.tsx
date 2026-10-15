"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HashBadgeProps {
  label?: string;
  value: string;
  truncateLength?: number;
  className?: string;
  copyable?: boolean;
}

export function HashBadge({
  label,
  value,
  truncateLength = 10,
  className,
  copyable = true,
}: HashBadgeProps) {
  const [copied, setCopied] = useState(false);

  const displayVal =
    value.length > truncateLength * 2 + 2
      ? `${value.slice(0, truncateLength + 2)}...${value.slice(-truncateLength)}`
      : value;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy text:", err);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {label && <span className="text-[10px] font-mono text-white/50">{label}:</span>}
      <Badge
        variant="secondary"
        className="font-mono text-[11px] bg-white/[0.04] border-white/10 text-white/90 hover:bg-white/[0.08] inline-flex items-center gap-1.5 py-0.5 px-2 font-normal"
      >
        <span title={value}>{displayVal}</span>
        {copyable && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? "Copied" : `Copy ${label || "value"}`}
                  className="p-0.5 text-white/40 hover:text-white rounded focus:outline-none focus:ring-1 focus:ring-white/20 inline-flex items-center justify-center transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span>{copied ? "Copied to clipboard" : "Click to copy"}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Badge>
    </div>
  );
}
