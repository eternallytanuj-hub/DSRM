"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TermsReaderProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown: bold, italic, inline code
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Regex splitting by bold (**...**), inline code (`...`), or italic (*...*)
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
      return (
        <code
          key={i}
          className="rounded bg-white/[0.04] px-1 py-0.5 font-mono text-[11px] text-white/90 border border-white/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
      return (
        <em key={i} className="italic text-white/60">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={i}>{token}</React.Fragment>;
  });
}

/**
 * Minimal, zero-dependency Markdown renderer supporting headings, lists, inline formatting and tables.
 */
export function TermsReader({ content, className }: TermsReaderProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableLines: string[] = [];

  const flushTable = (key: string) => {
    if (tableLines.length < 2) {
      tableLines = [];
      return;
    }

    const parseRow = (rowStr: string) =>
      rowStr
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());

    const headerCells = parseRow(tableLines[0]);
    // Skip tableLines[1] as it is the markdown separator row (| --- | --- |)
    const bodyRows = tableLines.slice(2).map(parseRow);

    elements.push(
      <div
        key={`tbl-${key}`}
        className="my-3 rounded-lg border border-white/[0.08] overflow-hidden bg-white/[0.02]"
      >
        <Table>
          <TableHeader>
            <TableRow>
              {headerCells.map((head, hi) => (
                <TableHead key={hi}>{renderInlineMarkdown(head)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bodyRows.map((row, ri) => (
              <TableRow key={ri}>
                {row.map((cell, ci) => (
                  <TableCell key={ci}>{renderInlineMarkdown(cell)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
    tableLines = [];
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();

    // Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      tableLines.push(trimmed);
      continue;
    } else if (tableLines.length > 0) {
      flushTable(`row-${idx}`);
    }

    if (!trimmed) {
      continue;
    }

    // Markdown Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={`h4-${idx}`}
          className="text-xs font-mono font-semibold text-white tracking-wide mt-3 mb-1"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${idx}`}
          className="text-sm font-mono font-semibold text-white tracking-wide mt-4 mb-2 pb-1 border-b border-white/[0.08]"
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h2
          key={`h2-${idx}`}
          className="text-base font-mono font-bold text-white tracking-wide mt-5 mb-2"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed.startsWith("- ")) {
      elements.push(
        <li
          key={`li-${idx}`}
          className="ml-4 list-disc text-xs text-[#9BA3B8] my-1 leading-relaxed"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </li>
      );
    } else {
      elements.push(
        <p
          key={`p-${idx}`}
          className="text-xs text-[#9BA3B8] my-2 leading-relaxed font-sans"
        >
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    }
  }

  if (tableLines.length > 0) {
    flushTable("final");
  }

  return (
    <div className={cn("space-y-1 text-xs text-[#9BA3B8]", className)}>
      {elements}
    </div>
  );
}
