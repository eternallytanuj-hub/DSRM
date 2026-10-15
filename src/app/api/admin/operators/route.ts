import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

const ADMIN_WALLETS = new Set(
  (process.env.ADMIN_WALLETS || "0xAD000000000000000000000000000000000000AD,0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
);

export async function GET(req: NextRequest) {
  try {
    const adminWallet = req.headers.get("x-admin-wallet");
    if (!adminWallet || !isAddress(adminWallet) || !ADMIN_WALLETS.has(adminWallet.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized: admin wallet required" }, { status: 401 });
    }

    // Return administrative queues
    const queue = {
      kybReviews: [
        {
          id: "kyb-req-001",
          operatorWallet: "0x1928374619283746192837461928374619283746",
          legalName: "Orbital Dynamics LLC",
          declaredCountry: "US",
          registrationNumber: "DE-2024-9988",
          jurisdiction: "Delaware, United States",
          documentHash: "0x7777777777777777777777777777777777777777777777777777777777777777",
          status: "PENDING",
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      regulatoryEvidence: [
        {
          id: "reg-req-001",
          operatorWallet: "0x1928374619283746192837461928374619283746",
          issuer: "FCC International Bureau",
          jurisdiction: "US",
          referenceNumber: "SAT-LOA-20250101-00012",
          documentHash: "0x8888888888888888888888888888888888888888888888888888888888888888",
          status: "SUBMITTED",
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    };

    return NextResponse.json({ success: true, queue });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
