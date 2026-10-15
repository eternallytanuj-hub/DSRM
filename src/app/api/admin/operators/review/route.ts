import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAddress } from "viem";

const ADMIN_WALLETS = new Set(
  (process.env.ADMIN_WALLETS || "0xAD000000000000000000000000000000000000AD,0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
);

const ReviewActionSchema = z.object({
  reviewType: z.enum(["KYB", "REGULATORY"]),
  id: z.string(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const adminWallet = req.headers.get("x-admin-wallet");
    if (!adminWallet || !isAddress(adminWallet) || !ADMIN_WALLETS.has(adminWallet.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized: admin wallet required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ReviewActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${parsed.data.reviewType} review ${parsed.data.id} set to ${parsed.data.decision} by ${adminWallet}`,
      reviewedBy: adminWallet,
      reviewedAt: new Date().toISOString(),
      actionRequired: parsed.data.decision === "APPROVED" ? "Attester oracle ready to sign claim" : "None",
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
