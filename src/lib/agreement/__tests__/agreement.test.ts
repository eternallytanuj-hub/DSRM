import { describe, it, expect } from "vitest";
import {
  canonicalizeText,
  computeTermsHash,
  computeUseDeclarationHash,
  generateBookingId,
} from "../hashes";
import {
  BOOKING_AGREEMENT_TYPES,
} from "../typedData";
import {
  scheduleFormSchema,
  createAcknowledgementsSchema,
} from "../schema";
import { parseAgreementTerms } from "../terms";
import { parsePartCAcknowledgements } from "../acknowledgements";
import { RAW_AGREEMENT_MARKDOWN, getAuthoritativeRawMarkdown } from "@/content/legal/agreementText";
import { hashTypedData } from "viem";

describe("Agreement Cryptographic & Canonicalisation Tests", () => {
  it("canonicalises text and matches fixed fixture hash", () => {
    const rawFixture = "  Article 1. Preamble \r\n Line with spaces   \r\n\r\n";
    const canonical = canonicalizeText(rawFixture);

    expect(canonical).toBe("Article 1. Preamble\n Line with spaces");

    const hash = computeTermsHash(canonical);
    // Recorded expected hash
    expect(hash).toBe(
      "0x0eecd724be55854e53474f1da170a96a249204afc5ea665af9fc556444d77819"
    );
  });

  it("computes exact termsHash for Template v1.0", () => {
    const parsed = parseAgreementTerms(RAW_AGREEMENT_MARKDOWN);
    expect(parsed.termsHash).toBe(
      "0x687e72ab87b18eb055a5d0fc6e94efc382d8828dc05bbdfa92c384f7dde331c2"
    );
    expect(parsed.version).toBe("1.0");
  });

  it("guarantees useDeclarationHash determinism regardless of key order", () => {
    const hash1 = computeUseDeclarationHash({
      category: "Commercial communications",
      declarationVersion: "1.0",
      otherDescription: "",
      targetRegion: "APAC",
    });

    const hash2 = computeUseDeclarationHash({
      targetRegion: "APAC",
      category: "Commercial communications",
      otherDescription: "",
      declarationVersion: "1.0",
    });

    expect(hash1).toBe(hash2);
    expect(hash1).toBe(
      "0x81abd252c1579eba0c02e4adcaaa88f34acb2a03e4354d546fb23908f774926f"
    );
  });

  it("produces exact typed-data digest matching fixed test vector", () => {
    const domain = {
      name: "DSRM",
      version: "1",
      chainId: BigInt(11155111),
      verifyingContract: "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735" as `0x${string}`,
    };

    const message = {
      bookingId: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" as `0x${string}`,
      buyer: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176" as `0x${string}`,
      operator: "0x5CDcB7F47De1aE89A24Adb55b0876C765C437735" as `0x${string}`,
      windowStart: BigInt(1700000000),
      windowEnd: BigInt(1700001800),
      amountWei: BigInt("100000000000000"),
      termsHash: "0x687e72ab87b18eb055a5d0fc6e94efc382d8828dc05bbdfa92c384f7dde331c2" as `0x${string}`,
      useDeclarationHash: "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      nonce: BigInt(42),
      deadline: BigInt(1700001000),
    };

    const digest = hashTypedData({
      domain,
      types: BOOKING_AGREEMENT_TYPES,
      primaryType: "BookingAgreement",
      message,
    });

    expect(digest).toBe(
      "0xf9d622cc00ad916e3f4941cc57a9cda59e27e9fae2659bb409c6eab368c6ed68"
    );
  });
});

describe("Zod Validation Schemas Tests", () => {
  const nowSec = Math.floor(Date.now() / 1000);
  const baseValidData = {
    bookingId: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    wallet: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176",
    buyerType: "Individual" as const,
    isAgent: false,
    legalName: "Valid Aerospace Corp",
    country: "US",
    email: "legal@aerospace.io",
    targetRegion: "Singapore Earth Station",
    frequencyBand: "Ku-Band",
    minElevation: "15 deg",
    dataVolume: "10 GB",
    latencyTarget: "< 50ms",
    intendedUseCategory: "Scientific research and education",
    windowStart: nowSec + 3600,
    windowEnd: nowSec + 5400,
    signatureDeadline: nowSec + 1800,
    amountWei: "100000000000000",
  };

  it("accepts valid booking schedule form data", () => {
    const res = scheduleFormSchema.safeParse(baseValidData);
    expect(res.success).toBe(true);
  });

  it("blocks comprehensively sanctioned countries in compliance gate", () => {
    const res = scheduleFormSchema.safeParse({
      ...baseValidData,
      country: "KP", // North Korea
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("Sanctions gate");
    }
  });

  it("rejects non-checksummed ethereum addresses", () => {
    const res = scheduleFormSchema.safeParse({
      ...baseValidData,
      wallet: "0xc25f9f0ce27a2d248c43563a32cdc4886d069176", // lowercase non-checksummed
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("checksummed");
    }
  });

  it("enforces Autonomous Agent principal name and address requirements", () => {
    const agentData = {
      ...baseValidData,
      buyerType: "Autonomous Agent" as const,
      isAgent: true,
      principalName: "",
      principalAddress: "",
    };
    const res = scheduleFormSchema.safeParse(agentData);
    expect(res.success).toBe(false);
    if (!res.success) {
      const paths = res.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("principalName");
      expect(paths).toContain("principalAddress");
    }
  });

  it("requires minimum 10 char description when category is Other", () => {
    const otherData = {
      ...baseValidData,
      intendedUseCategory: "Other",
      otherDescription: "Short",
    };
    const res = scheduleFormSchema.safeParse(otherData);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].path).toContain("otherDescription");
    }
  });

  it("rejects invalid window start/end order", () => {
    const invalidWindow = {
      ...baseValidData,
      windowStart: nowSec + 5400,
      windowEnd: nowSec + 3600,
    };
    const res = scheduleFormSchema.safeParse(invalidWindow);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("start time must be strictly before end time");
    }
  });

  it("enforces deadline rules: must be future and <= min(now+24h, windowStart)", () => {
    // Past deadline
    const pastRes = scheduleFormSchema.safeParse({
      ...baseValidData,
      signatureDeadline: nowSec - 100,
    });
    expect(pastRes.success).toBe(false);

    // Deadline beyond windowStart
    const beyondRes = scheduleFormSchema.safeParse({
      ...baseValidData,
      windowStart: nowSec + 1000,
      signatureDeadline: nowSec + 2000,
    });
    expect(beyondRes.success).toBe(false);
  });

  it("acknowledgements schema dynamically requires C10 only for agents", () => {
    const nonAgentSchema = createAcknowledgementsSchema(false);
    const nonAgentPass = nonAgentSchema.safeParse({
      C1: true,
      C2: true,
      C3: true,
      C4: true,
      C5: true,
      C6: true,
      C7: true,
      C8: true,
      C9: true,
    });
    expect(nonAgentPass.success).toBe(true);

    const agentSchema = createAcknowledgementsSchema(true);
    const agentFail = agentSchema.safeParse({
      C1: true,
      C2: true,
      C3: true,
      C4: true,
      C5: true,
      C6: true,
      C7: true,
      C8: true,
      C9: true,
    });
    expect(agentFail.success).toBe(false);

    const agentPass = agentSchema.safeParse({
      C1: true,
      C2: true,
      C3: true,
      C4: true,
      C5: true,
      C6: true,
      C7: true,
      C8: true,
      C9: true,
      C10: true,
    });
    expect(agentPass.success).toBe(true);
  });
});

describe("Terms & Acknowledgements Parser Tests", () => {
  it("parses exactly 20 articles and 6 schedules (A to F)", () => {
    const parsed = parseAgreementTerms(RAW_AGREEMENT_MARKDOWN);

    expect(parsed.articles.length).toBe(20);
    expect(parsed.articles[0].title).toBe("Article 1. Definitions");
    expect(parsed.articles[19].title).toBe("Article 20. General");

    expect(parsed.schedules.length).toBe(6);
    expect(parsed.schedules.map((s) => s.letter)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
    ]);
  });

  it("parses acknowledgements C1 to C10 from Part C", () => {
    const acks = parsePartCAcknowledgements(RAW_AGREEMENT_MARKDOWN, "simulated");
    expect(acks.length).toBe(10);
    expect(acks.map((a) => a.id)).toEqual([
      "C1",
      "C2",
      "C3",
      "C4",
      "C5",
      "C6",
      "C7",
      "C8",
      "C9",
      "C10",
    ]);
    expect(acks[9].isAgentOnly).toBe(true);
    expect(acks[3].text).toContain("results are simulated");

    const prodAcks = parsePartCAcknowledgements(RAW_AGREEMENT_MARKDOWN, "production");
    expect(prodAcks[3].text).toContain("attesters are independent");
  });

  it("loads authoritative markdown dynamically and produces identical termsHash", () => {
    const rawDynamic = getAuthoritativeRawMarkdown();
    expect(rawDynamic.length).toBeGreaterThan(1000);
    const parsed = parseAgreementTerms(rawDynamic);
    expect(parsed.termsHash).toBe(
      "0x687e72ab87b18eb055a5d0fc6e94efc382d8828dc05bbdfa92c384f7dde331c2"
    );
    expect(parsed.articles.length).toBe(20);
    expect(parsed.schedules.length).toBe(6);
  });
});

describe("Booking ID & Hex Edge Cases", () => {
  it("generateBookingId returns valid 32-byte hex strings and does not collide", () => {
    const id1 = generateBookingId();
    const id2 = generateBookingId();

    expect(id1).toMatch(/^0x[a-f0-9]{64}$/);
    expect(id2).toMatch(/^0x[a-f0-9]{64}$/);
    expect(id1).not.toBe(id2);
  });

  it("rejects whitespace-only principal name and address for Autonomous Agent", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const whitespaceAgent = {
      bookingId: generateBookingId(),
      wallet: "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176",
      buyerType: "Autonomous Agent" as const,
      isAgent: true,
      legalName: "AI Satellite Pilot #1",
      country: "US",
      email: "agent@autonomous.space",
      principalName: "    ",
      principalAddress: "\t\n  ",
      targetRegion: "Singapore Earth Station",
      frequencyBand: "Ku-Band",
      minElevation: "15 deg",
      dataVolume: "10 GB",
      latencyTarget: "< 50ms",
      intendedUseCategory: "Scientific research and education",
      windowStart: nowSec + 3600,
      windowEnd: nowSec + 5400,
      signatureDeadline: nowSec + 1800,
      amountWei: "100000000000000",
    };

    const res = scheduleFormSchema.safeParse(whitespaceAgent);
    expect(res.success).toBe(false);
    if (!res.success) {
      const paths = res.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("principalName");
      expect(paths).toContain("principalAddress");
    }
  });

  it("serializes BigInts as decimal strings in API communication payloads", () => {
    const payload = {
      bookingId: "0x1234",
      amountWei: BigInt("1000000000000000000").toString(),
      nonce: BigInt(42).toString(),
      deadline: BigInt(1700001000).toString(),
    };

    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json);
    expect(typeof parsed.amountWei).toBe("string");
    expect(parsed.amountWei).toBe("1000000000000000000");
    expect(BigInt(parsed.amountWei)).toBe(BigInt("1000000000000000000"));
  });
});

