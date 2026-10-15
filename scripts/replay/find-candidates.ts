/**
 * Find recent SatNOGS observations with vetted good status and demodulated data.
 * 
 * Usage:
 *   npx tsx scripts/replay/find-candidates.ts <noradId...>
 * Example:
 *   npx tsx scripts/replay/find-candidates.ts 43017 26931 43137
 */

interface SatnogsObservationListItem {
  id: number;
  start: string;
  end: string;
  ground_station: number;
  norad_cat_id: number;
  vetted_status: string;
  demoddata?: unknown[];
  waterfall?: string;
  station_name?: string;
}

async function findCandidates(noradIds: string[]) {
  if (noradIds.length === 0) {
    console.log("Usage: npx tsx scripts/replay/find-candidates.ts <noradId...>");
    console.log("Popular telemetry satellites with SatNOGS demodulated data:");
    console.log("  43017: AO-91 (RadFxSat)");
    console.log("  26931: NO-44 (PCSAT)");
    console.log("  43137: AO-92 (Fox-1D)");
    console.log("  47438: UVSQ-SAT");
    console.log("  42017: EO-88 (Nayif-1)");
    return;
  }

  for (const noradId of noradIds) {
    console.log(`\n==================================================`);
    console.log(`Searching SatNOGS for NORAD ID: ${noradId}...`);
    console.log(`==================================================`);

    const url = `https://network.satnogs.org/api/observations/?satellite__norad_cat_id=${noradId}&vetted_status=good&limit=25`;
    try {
      const resp = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!resp.ok) {
        console.warn(`[WARN] SatNOGS API responded with status ${resp.status} for NORAD ${noradId}`);
        continue;
      }

      const observations = (await resp.json()) as SatnogsObservationListItem[];
      console.log(`Fetched ${observations.length} good observations.`);

      let candidatesFound = 0;
      for (const obs of observations) {
        // Query demod data endpoint for this observation
        const demodUrl = `https://network.satnogs.org/api/observations/${obs.id}/`;
        const obsResp = await fetch(demodUrl, {
          headers: { Accept: "application/json" },
        });

        if (!obsResp.ok) continue;
        const obsDetail = await obsResp.json();
        const demodList = obsDetail.demoddata || [];

        if (demodList.length > 0) {
          candidatesFound++;
          console.log(`\n-> Candidate Found! Observation ID: ${obs.id}`);
          console.log(`   Time: ${obs.start} to ${obs.end}`);
          console.log(`   Station ID: ${obs.ground_station}`);
          console.log(`   Demodulated Frames: ${demodList.length}`);
          console.log(`   URL: https://network.satnogs.org/observations/${obs.id}/`);
        }
      }

      if (candidatesFound === 0) {
        console.log(`No observations with demodulated data found in recent results for NORAD ${noradId}.`);
      }
    } catch (err) {
      console.error(`Error querying SatNOGS API for NORAD ${noradId}:`, (err as Error).message);
    }
  }
}

const args = process.argv.slice(2);
findCandidates(args);
