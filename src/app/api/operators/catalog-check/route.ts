import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { performCatalogCheck } from "@/lib/operators/catalog";
import { checkRateLimit } from "@/lib/operators/auth";

const CatalogCheckSchema = z.object({
  noradId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]),
  declaredCountry: z.string().min(2).max(4).default("US"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`catalog:${ip}`, 60, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded for catalog queries." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = CatalogCheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid NORAD ID or country" }, { status: 400 });
    }

    const result = await performCatalogCheck(parsed.data.noradId, parsed.data.declaredCountry);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
