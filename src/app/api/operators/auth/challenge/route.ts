import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateOperatorChallenge, checkRateLimit } from "@/lib/operators/auth";

const ChallengeSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`challenge:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: "Too many requests. Rate limit exceeded." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ChallengeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { challenge, nonce } = generateOperatorChallenge(parsed.data.address);
    return NextResponse.json({ success: true, challenge, nonce });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
