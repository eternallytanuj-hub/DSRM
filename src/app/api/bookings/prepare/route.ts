import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseEther } from "viem";
import { enforceBookingPrepare } from "@/lib/operators/capsEnforcement";
import { checkRateLimit } from "@/lib/operators/auth";

const BookingPrepareSchema = z.object({
  operator_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid operator address"),
  buyer_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid buyer address"),
  amount_eth: z.string().min(1),
  is_demo: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`booking-prep:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = BookingPrepareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const amountWei = parseEther(parsed.data.amount_eth);
    const enforcement = await enforceBookingPrepare(
      parsed.data.operator_address,
      amountWei,
      parsed.data.is_demo
    );

    if (!enforcement.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: enforcement.reason,
          currentTier: enforcement.currentTier,
          caps: enforcement.caps,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      allowed: true,
      currentTier: enforcement.currentTier,
      caps: enforcement.caps,
      payoutHoldHours: enforcement.payoutHoldHours,
      payoutHoldSeconds: enforcement.payoutHoldSeconds,
      deliveryBoundChallengeRequired: enforcement.deliveryBoundChallengeRequired,
      note: "On-chain enforcement of caps and payout holds awaits SatelliteEscrow v2 that reads capsOf.",
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
