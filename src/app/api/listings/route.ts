import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceListingWindowCreation, incrementActiveWindows } from "@/lib/operators/capsEnforcement";
import { checkRateLimit } from "@/lib/operators/auth";

const CreateListingSchema = z.object({
  operator_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid operator address"),
  satellite_name: z.string().min(1),
  norad_id: z.number().int().positive().optional(),
  window_start: z.string().optional(),
  window_end: z.string().optional(),
  price_eth: z.string().default("0.001"),
  is_demo: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`listings:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = CreateListingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const enforcement = await enforceListingWindowCreation(
      parsed.data.operator_address,
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

    // Increment active window count
    incrementActiveWindows(parsed.data.operator_address);

    return NextResponse.json({
      success: true,
      message: "Listing window created successfully within tier allowance.",
      currentTier: enforcement.currentTier,
      caps: enforcement.caps,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
