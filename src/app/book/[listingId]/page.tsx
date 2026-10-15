import React from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { DEFAULT_REAL_PASSES, SatellitePass } from "@/app/(stitch)/marketplace/types";
import { fetchOperatorListings } from "@/app/actions/supabase";

interface BookPageProps {
  params: Promise<{ listingId: string }>;
}

export default async function BookPassPage({ params }: BookPageProps) {
  const { listingId } = await params;
  const decodedId = decodeURIComponent(listingId);

  // 1. Check DEFAULT_REAL_PASSES
  let pass: SatellitePass | undefined = DEFAULT_REAL_PASSES.find(
    (p) => p.id.toLowerCase() === decodedId.toLowerCase() || p.name.toLowerCase() === decodedId.toLowerCase()
  );

  // 2. If not found, check Supabase operator listings
  if (!pass) {
    try {
      const opRes = await fetchOperatorListings();
      if (opRes.success && opRes.data) {
        const found = opRes.data.find(
          (op) =>
            op.id.toLowerCase() === decodedId.toLowerCase() ||
            `OP-${op.id.slice(0, 8)}`.toLowerCase() === decodedId.toLowerCase()
        );
        if (found) {
          pass = {
            id: `OP-${found.id.slice(0, 8)}`,
            operatorListingId: found.id,
            operatorAddress: found.operator_address || undefined,
            noradId: found.norad_id || undefined,
            name: found.satellite_name,
            operator: `${found.operator_name} (Operator)`,
            cat: found.category?.toLowerCase() || "communication",
            speed: `${found.bandwidth || "500 Mbps"} (${found.band || "Ku/Ka-Band"})`,
            window: found.window_display || "On-Demand Window",
            price: found.price_eth || "0.0001 Sepolia ETH",
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  // 3. Fallback for demo/dynamic satellites if not in list
  if (!pass) {
    pass = {
      id: decodedId,
      name: decodedId,
      operator: "DSRM Orbital Network",
      speed: "250 Mbps (Ku/Ka-Band)",
      window: "Active Scheduled Pass",
      price: "0.0001 Sepolia ETH",
      cat: "communication",
    };
  }

  return (
    <main className="min-h-screen bg-[#07080C] text-[#F0F3F8] mkt-stage">
      <BookingWizard listing={pass} />
    </main>
  );
}
