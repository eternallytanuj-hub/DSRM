import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getOperatorStatus } from "@/lib/operators/tierService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: "Invalid operator address" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const isDemo = searchParams.get("demo") === "true";

    const status = await getOperatorStatus(address, { isDemo });
    return NextResponse.json({ success: true, ...status });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
