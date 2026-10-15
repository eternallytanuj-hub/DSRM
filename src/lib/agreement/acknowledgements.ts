import { getAuthoritativeRawMarkdown } from "@/content/legal/agreementText";

export interface AcknowledgementItem {
  id: string; // "C1" ... "C10"
  number: number;
  text: string;
  isAgentOnly: boolean;
}

/**
 * Parses C1 to C10 acknowledgements directly from Part C of the legal agreement markdown.
 * Single source of truth — no hardcoded texts.
 */
export function parsePartCAcknowledgements(
  markdown: string = getAuthoritativeRawMarkdown(),
  oracleMode: "simulated" | "production" = (process.env.NEXT_PUBLIC_ORACLE_MODE as "simulated" | "production") || "simulated"
): AcknowledgementItem[] {
  const partCIndex = markdown.indexOf("# PART C:");
  const schedulesIndex = markdown.indexOf("# SCHEDULES");
  const partCText =
    partCIndex !== -1
      ? markdown.slice(partCIndex, schedulesIndex !== -1 ? schedulesIndex : undefined)
      : markdown;

  const regex = /^- \[ \] (C(\d+))\.\s*(.*)$/gm;
  const items: AcknowledgementItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(partCText)) !== null) {
    const id = match[1];
    const num = parseInt(match[2], 10);
    let text = match[3].trim();

    // Select C4 variant according to NEXT_PUBLIC_ORACLE_MODE
    if (id === "C4") {
      text = text.replace(
        /\\?\[PRODUCTION:\s*(.*?)\s*\/\s*SIMULATED:\s*(.*?)\\?\]/,
        (_m, prod, sim) => (oracleMode === "production" ? prod : sim)
      );
    }

    items.push({
      id,
      number: num,
      text,
      isAgentOnly: id === "C10",
    });
  }

  return items;
}
