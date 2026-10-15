import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDomainChallenge } from "@/lib/operators/domain";
import { checkRateLimit } from "@/lib/operators/auth";

const ChallengeSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  domain: z.string().min(3).max(253),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`domain-challenge:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ChallengeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const challenge = createDomainChallenge(parsed.data.address, parsed.data.domain);
    return NextResponse.json({ success: true, challenge });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
