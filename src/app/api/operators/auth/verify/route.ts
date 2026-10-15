import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOperatorLogin, checkRateLimit } from "@/lib/operators/auth";

const VerifySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, "Invalid ECDSA signature hex"),
  nonce: z.string().min(8, "Invalid nonce"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`verify:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: "Too many requests. Rate limit exceeded." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { token, expiresAt } = await verifyOperatorLogin(
      parsed.data.address,
      parsed.data.signature as `0x${string}`,
      parsed.data.nonce
    );

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      address: parsed.data.address.toLowerCase(),
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}
