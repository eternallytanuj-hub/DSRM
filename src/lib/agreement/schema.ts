import { z } from "zod";
import { isAddress, getAddress } from "viem";
import { isCountryBlocked } from "@/config/compliance";

export const buyerTypeEnum = z.enum([
  "Individual",
  "Company",
  "Institution",
  "Autonomous Agent",
]);

export type BuyerType = z.infer<typeof buyerTypeEnum>;

/**
 * Step 1: Part A (Booking Schedule) + Schedule C Validation Schema
 */
export const scheduleFormSchema = z
  .object({
    // A1: bookingId (bytes32 hex string)
    bookingId: z
      .string()
      .regex(/^0x[a-fA-F0-9]{64}$/, "Booking ID must be a valid 32-byte hex string (0x...)"),

    // A2: wallet address (checksummed)
    wallet: z.string().refine(
      (val) => {
        try {
          return isAddress(val) && getAddress(val) === val;
        } catch {
          return false;
        }
      },
      { message: "Must be a valid checksummed Ethereum address" }
    ),

    // A3 & Agent switch
    buyerType: buyerTypeEnum,
    isAgent: z.boolean(),

    // A4: Legal name
    legalName: z
      .string()
      .min(1, "Legal name or entity name is required")
      .max(120, "Name must be 120 characters or fewer"),

    // A5: Country (ISO select) with compliance gate
    country: z
      .string()
      .min(2, "Country is required")
      .refine((code) => !isCountryBlocked(code), {
        message:
          "Sanctions gate: Bookings from comprehensively sanctioned jurisdictions are restricted.",
      }),

    // A6: Email
    email: z.string().email("A valid contact email for legal notices is required"),

    // A7: Principal name & address (required if isAgent)
    principalName: z.string().optional(),
    principalAddress: z.string().optional(),

    // A11: Target ground station or region
    targetRegion: z
      .string()
      .min(2, "Target region, ground station, or coordinates required")
      .max(120),

    // A12: Technical parameters
    frequencyBand: z.string().min(1, "Frequency band is required"),
    minElevation: z.string().min(1, "Minimum elevation angle is required"),
    dataVolume: z.string().min(1, "Data volume is required"),
    latencyTarget: z.string().min(1, "Latency target is required"),

    // A13: Schedule C intended use category
    intendedUseCategory: z.string().min(1, "Intended use category is required"),
    otherDescription: z.string().optional(),

    // A10: Pass window (UTC seconds)
    windowStart: z.number().int().positive("Window start timestamp required"),
    windowEnd: z.number().int().positive("Window end timestamp required"),

    // A17: Signature deadline (UTC seconds)
    signatureDeadline: z.number().int().positive("Signature deadline timestamp required"),

    // A14: Amount in wei (bigint string)
    amountWei: z.string().refine(
      (val) => {
        try {
          const b = BigInt(val);
          return b > BigInt(0);
        } catch {
          return false;
        }
      },
      { message: "Amount must be a positive integer in wei" }
    ),
  })
  .superRefine((data, ctx) => {
    // Agent rules: if isAgent is true, A7 principal details are strictly required
    if (data.isAgent) {
      if (!data.principalName || !data.principalName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Principal legal name is required when booking as an Autonomous Agent.",
          path: ["principalName"],
        });
      }
      if (!data.principalAddress || !data.principalAddress.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Principal legal address is required when booking as an Autonomous Agent.",
          path: ["principalAddress"],
        });
      }
    }

    // Schedule C: "Other" category requires explanation (min 10 chars)
    const cat = data.intendedUseCategory.toLowerCase();
    if (cat === "other") {
      if (!data.otherDescription || data.otherDescription.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Category 'Other' requires a descriptive statement (minimum 10 characters).",
          path: ["otherDescription"],
        });
      }
    }

    // Pass window: start must precede end
    if (data.windowStart >= data.windowEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pass window start time must be strictly before end time.",
        path: ["windowEnd"],
      });
    }

    // Signature deadline rules:
    // 1. Must be in the future
    // 2. Maximum is the smaller of (now + 24 hours) and windowStart
    const nowSec = Math.floor(Date.now() / 1000);
    if (data.signatureDeadline <= nowSec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Signature deadline must be set in the future.",
        path: ["signatureDeadline"],
      });
    }

    const maxDeadline = Math.min(nowSec + 86400, data.windowStart);
    if (data.signatureDeadline > maxDeadline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Signature deadline cannot exceed ${
          data.windowStart < nowSec + 86400
            ? "the pass window start time"
            : "24 hours from now"
        }.`,
        path: ["signatureDeadline"],
      });
    }
  });

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

/**
 * Creates dynamic Zod schema for Part C Acknowledgements.
 * If isAgent is true, C10 is required; otherwise C1-C9 only.
 */
export function createAcknowledgementsSchema(isAgent: boolean) {
  const shape: Record<string, z.ZodLiteral<true>> = {
    C1: z.literal(true),
    C2: z.literal(true),
    C3: z.literal(true),
    C4: z.literal(true),
    C5: z.literal(true),
    C6: z.literal(true),
    C7: z.literal(true),
    C8: z.literal(true),
    C9: z.literal(true),
  };

  if (isAgent) {
    shape.C10 = z.literal(true);
  }

  return z.object(shape);
}
