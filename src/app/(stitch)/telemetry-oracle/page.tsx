import fs from "node:fs/promises";
import path from "node:path";
import { TelemetryReplayView } from "@/components/replay/TelemetryReplayView";
import type { EvidenceBundle } from "@/lib/replay/types";

export const dynamic = "force-dynamic";

export default async function TelemetryOraclePage() {
  const observationId = process.env.NEXT_PUBLIC_REPLAY_DEFAULT_OBSERVATION || "11726893";
  const registryAddress = process.env.NEXT_PUBLIC_ATTESTATION_REGISTRY;

  let initialBundle: EvidenceBundle | null = null;
  try {
    const p = path.resolve(process.cwd(), `public/replay/${observationId}/bundle.json`);
    const raw = await fs.readFile(p, "utf-8");
    initialBundle = JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load initial bundle on server:", err);
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-zinc-800">
      <TelemetryReplayView
        initialBundle={initialBundle}
        observationId={observationId}
        registryAddress={registryAddress}
      />
    </main>
  );
}
