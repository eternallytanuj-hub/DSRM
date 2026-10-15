import { getAuthoritativeRawMarkdown } from "@/content/legal/agreementText";
import { canonicalizeText, computeTermsHash } from "./hashes";

export interface ArticleItem {
  number: number;
  id: string;
  title: string;
  body: string;
}

export interface ScheduleItem {
  letter: string;
  id: string;
  title: string;
  body: string;
}

export interface ParsedTerms {
  version: string;
  termsHash: `0x${string}`;
  canonicalText: string;
  rawText: string;
  articles: ArticleItem[];
  schedules: ScheduleItem[];
  placeholderCount: number;
}

/**
 * Parses markdown into Articles and Schedules per Section 2 of requirements.
 */
export function parseAgreementTerms(markdown: string = getAuthoritativeRawMarkdown()): ParsedTerms {
  const canonical = canonicalizeText(markdown);
  const termsHash = computeTermsHash(canonical);

  // Unresolved placeholders matching /\[[^\]\n]+\]/
  const placeholderMatches = markdown.match(/\[[^\]\n]+\]/g);
  const placeholderCount = placeholderMatches ? placeholderMatches.length : 0;

  // Split into sections
  const partBIndex = markdown.indexOf("# PART B: TERMS");
  const partCIndex = markdown.indexOf("# PART C:");
  const schedulesIndex = markdown.indexOf("# SCHEDULES");

  const partBText =
    partBIndex !== -1
      ? markdown.slice(partBIndex, partCIndex !== -1 ? partCIndex : undefined)
      : "";
  const schedulesText = schedulesIndex !== -1 ? markdown.slice(schedulesIndex) : "";

  // Parse Articles
  const articleRegex = /^## Article (\d+)\.\s*(.*)$/gm;
  const articles: ArticleItem[] = [];
  const articleMatches: Array<{
    number: number;
    title: string;
    index: number;
    headerLength: number;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = articleRegex.exec(partBText)) !== null) {
    articleMatches.push({
      number: parseInt(match[1], 10),
      title: match[2].trim(),
      index: match.index,
      headerLength: match[0].length,
    });
  }

  for (let i = 0; i < articleMatches.length; i++) {
    const cur = articleMatches[i];
    const next = articleMatches[i + 1];
    const startIndex = cur.index + cur.headerLength;
    const endIndex = next ? next.index : partBText.length;
    const body = partBText.slice(startIndex, endIndex).trim();
    articles.push({
      number: cur.number,
      id: `article-${cur.number}`,
      title: `Article ${cur.number}. ${cur.title}`,
      body,
    });
  }

  // Parse Schedules
  const scheduleRegex = /^## Schedule ([A-F])\.\s*(.*)$/gm;
  const schedules: ScheduleItem[] = [];
  const schedMatches: Array<{
    letter: string;
    title: string;
    index: number;
    headerLength: number;
  }> = [];

  while ((match = scheduleRegex.exec(schedulesText)) !== null) {
    schedMatches.push({
      letter: match[1],
      title: match[2].trim(),
      index: match.index,
      headerLength: match[0].length,
    });
  }

  for (let i = 0; i < schedMatches.length; i++) {
    const cur = schedMatches[i];
    const next = schedMatches[i + 1];
    const startIndex = cur.index + cur.headerLength;
    const endIndex = next ? next.index : schedulesText.length;
    const body = schedulesText.slice(startIndex, endIndex).trim();
    schedules.push({
      letter: cur.letter,
      id: `schedule-${cur.letter.toLowerCase()}`,
      title: `Schedule ${cur.letter}. ${cur.title}`,
      body,
    });
  }

  // Version extraction from Schedule F or default 1.0
  let version = "1.0";
  const scheduleF = schedules.find((s) => s.letter === "F");
  if (scheduleF) {
    const vMatch = scheduleF.body.match(/\|\s*(\d+\.\d+)\s*\|/);
    if (vMatch) {
      version = vMatch[1];
    }
  }

  return {
    version,
    termsHash,
    canonicalText: canonical,
    rawText: markdown,
    articles,
    schedules,
    placeholderCount,
  };
}
