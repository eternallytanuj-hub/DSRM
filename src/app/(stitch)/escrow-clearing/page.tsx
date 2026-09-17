'use client';
export default function Escrow() {
  return (
    <div 
      className="select-none h-full w-full"
      dangerouslySetInnerHTML={{ __html: `<main class="relative w-full flex-1 bg-canvas-base"><div class="flex flex-col w-full text-text-primary font-body-md text-body-md select-none">
<!-- TOP METRICS STRIP: Financial & Verification Integrity Deck -->
<section class="w-full bg-surface-panel border-b border-border-default px-margin-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-md">
<div class="flex items-center gap-space-lg divide-x divide-border-default overflow-x-auto">
<div class="flex flex-col pr-space-md">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[13px] text-primary">lock</span>
          TOTAL LOCKED VALUE IN ESCROW
        </span>
<div class="flex items-baseline gap-space-xs mt-0.5">
<span class="font-code-md text-headline-sm font-semibold tracking-tight text-text-primary">\$184,250.00</span>
<span class="font-label-sm text-label-sm text-primary">USDC</span>
<span class="font-code-sm text-code-sm text-text-tertiary ml-space-xs">(0x7F9a...4B12)</span>
</div>
</div>
<div class="flex flex-col px-space-md">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[13px] text-status-active">radar</span>
          ACTIVE PASS ESCROWS
        </span>
<div class="flex items-baseline gap-space-xs mt-0.5">
<span class="font-code-md text-headline-sm font-semibold text-text-primary">14</span>
<span class="font-label-sm text-label-sm text-text-secondary uppercase">Windows Active</span>
<span class="inline-block w-1.5 h-1.5 rounded-none bg-status-nominal ml-space-xs animate-pulse"></span>
</div>
</div>
<div class="flex flex-col px-space-md">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[13px] text-hash-spectral">hub</span>
          MULTI-STATION ATTESTATIONS
        </span>
<div class="flex items-baseline gap-space-xs mt-0.5">
<span class="font-code-md text-headline-sm font-semibold text-text-primary">38</span>
<span class="font-label-sm text-label-sm text-text-secondary">SatNOGS NODES</span>
<span class="font-label-sm text-label-sm text-status-nominal ml-space-xs">[SYNCHRONIZED]</span>
</div>
</div>
<div class="flex flex-col px-space-md">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[13px] text-status-nominal">verified</span>
          24H SETTLED / RELEASED
        </span>
<div class="flex items-baseline gap-space-xs mt-0.5">
<span class="font-code-md text-headline-sm font-semibold text-status-nominal">\$48,620.00</span>
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">USDC</span>
<span class="font-label-sm text-label-sm text-text-secondary ml-space-xs">(0 Slashes)</span>
</div>
</div>
<div class="flex flex-col pl-space-md">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[13px] text-status-pending">gavel</span>
          DON QUORUM CONSENSUS
        </span>
<div class="flex items-baseline gap-space-xs mt-0.5">
<span class="font-code-md text-headline-sm font-semibold text-status-nominal">5 / 7</span>
<span class="font-label-sm text-label-sm text-text-secondary">NODES SIGNED</span>
<span class="bg-status-nominal-surface text-status-nominal border border-status-nominal px-1 font-label-sm text-[9px] uppercase tracking-wider ml-space-xs">THRESHOLD MET</span>
</div>
</div>
</div>
<!-- Quick Ledger Nav / Execution Bar -->
<div class="flex items-center gap-space-sm ml-auto">
<div class="flex items-center gap-space-xs font-label-sm text-label-sm border border-border-default bg-surface-inset px-space-sm py-1">
<span class="text-text-tertiary">LEDGER EPOCH:</span>
<span class="font-code-sm text-code-sm text-text-primary font-medium">#10842-SEP</span>
</div>
<button class="h-7 px-space-sm bg-surface-inset border border-border-default hover:border-border-active text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-none" onclick="window.location.reload()">
<span class="material-symbols-outlined text-[14px]">refresh</span>
        REFRESH PIPELINE
      </button>
</div>
</section>
<!-- MASTER WORKSPACE DECK: TWO-COLUMN DISPOSITION (62% / 38%) -->
<div class="w-full grid grid-cols-1 xl:grid-cols-12 gap-0 border-b border-border-default">
<!-- LEFT DECK: LIVE ESCROW SETTLEMENT LEDGER & VERIFICATION FLOW (XL: 62% -> 7 or 8 cols, using 7.5 ratio / col-span-7) -->
<section class="xl:col-span-7 border-b xl:border-b-0 xl:border-r border-border-default bg-canvas-base flex flex-col">
<!-- CONTRACT HEADER STRIP -->
<div class="bg-surface-panel p-space-md border-b border-border-default flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-space-sm">
<span class="px-space-xs py-0.5 font-label-sm text-label-sm uppercase bg-primary-fixed-dim text-on-primary-fixed-variant font-semibold">TARGET SETTLEMENT RECORD</span>
<span class="font-code-md text-headline-sm text-text-primary font-bold">#OA-1042-SEP</span>
<span class="font-code-sm text-code-sm text-text-tertiary">|</span>
<span class="font-label-sm text-label-sm text-text-secondary">NORAD #58214</span>
</div>
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">ESCROW VAULT:</span>
<span class="font-code-sm text-code-sm text-primary hover:underline cursor-pointer">0x82a9...df34</span>
<span class="material-symbols-outlined text-[14px] text-text-tertiary cursor-pointer hover:text-text-primary">content_copy</span>
</div>
</div>
<div class="grid grid-cols-2 sm:grid-cols-4 gap-space-xs pt-space-xs border-t border-border-default font-label-sm text-label-sm">
<div>
<div class="text-text-tertiary">OPERATOR // SATELLITE:</div>
<div class="font-body-md text-headline-sm text-text-primary font-semibold">ORBITEX SAT-07</div>
<div class="text-text-secondary text-[11px]">LEO (550 km Sun-Sync)</div>
</div>
<div>
<div class="text-text-tertiary">BANDWIDTH DOWNLINK:</div>
<div class="font-code-md text-headline-sm text-text-primary font-semibold">50.0 Mbps</div>
<div class="text-text-secondary text-[11px]">S-Band 2245.5 MHz</div>
</div>
<div>
<div class="text-text-tertiary">PASS WINDOW (UTC):</div>
<div class="font-code-sm text-code-sm text-text-primary">18:41:00 - 18:52:14</div>
<div class="text-status-nominal text-[11px] font-medium">COMPLETED 12m 14s</div>
</div>
<div>
<div class="text-text-tertiary">COMMITTED STAKE:</div>
<div class="font-code-md text-headline-sm text-text-primary font-semibold">12,500.00 USDC</div>
<div class="text-text-tertiary text-[11px]">RELAY: MULTI-SIG 3/5</div>
</div>
</div>
<!-- ESCROW STATUS BAR (SHARP RECTANGULAR, NO SOFT GLOW OR BLUR) -->
<div class="mt-space-xs border border-status-pending bg-status-pending-surface px-space-md py-space-sm flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="w-2.5 h-2.5 bg-status-pending inline-block animate-ping"></span>
<span class="font-label-md text-label-md font-bold text-status-pending uppercase tracking-wider">
              FUNDS LOCKED // AWAITING TELEMETRY QUORUM RATIFICATION
            </span>
</div>
<div class="font-code-sm text-code-sm text-text-secondary">
            AUTO-RELEASE IN: <span class="text-text-primary font-semibold">00:04:18</span>
</div>
</div>
</div>
<!-- FIVE-STEP FORENSIC VERIFICATION PIPELINE -->
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex items-center justify-between pb-space-xs border-b border-border-default">
<span class="font-label-md text-label-md text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-primary">fact_check</span>
            VERIFICATION PIPELINE & ON-CHAIN CLEARING ATTESTATIONS
          </span>
<span class="font-label-sm text-label-sm text-status-nominal font-code-sm">5 OF 5 PHASES READY FOR FINALIZATION</span>
</div>
<!-- STEP ACCORDION / AUDIT LIST -->
<div class="space-y-space-xs font-label-sm text-label-sm">
<!-- STEP 1 -->
<div class="border border-border-default bg-surface-panel p-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="w-5 h-5 bg-status-nominal-surface border border-status-nominal text-status-nominal flex items-center justify-center font-code-sm text-[10px] font-bold">1</span>
<div>
<span class="font-label-md text-label-md font-semibold text-text-primary uppercase">Pass Window Ephemeris Verification</span>
<span class="text-text-tertiary ml-space-sm">// Celestrak & Space-Track SGP4 Ingest</span>
</div>
</div>
<span class="border border-status-nominal bg-status-nominal-surface text-status-nominal px-space-xs py-0 text-[10px] font-code-sm uppercase font-semibold">TLE Propagated - PASSED</span>
</div>
<div class="mt-space-xs pt-space-xs border-t border-border-default grid grid-cols-3 gap-space-xs text-text-secondary font-code-sm">
<div>AOS: <span class="text-text-primary">18:41:00 UTC</span></div>
<div>LOS: <span class="text-text-primary">18:52:14 UTC</span></div>
<div>MAX ELEVATION: <span class="text-text-primary">74.8 deg (Az: 142.1)</span></div>
</div>
</div>
<!-- STEP 2 -->
<div class="border border-border-default bg-surface-panel p-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="w-5 h-5 bg-status-nominal-surface border border-status-nominal text-status-nominal flex items-center justify-center font-code-sm text-[10px] font-bold">2</span>
<div>
<span class="font-label-md text-label-md font-semibold text-text-primary uppercase">Pre-Pass Atmospheric & RF Attenuation Check</span>
<span class="text-text-tertiary ml-space-sm">// NOAA GFS & Open-Meteo Radome Ingest</span>
</div>
</div>
<span class="border border-status-nominal bg-status-nominal-surface text-status-nominal px-space-xs py-0 text-[10px] font-code-sm uppercase font-semibold">CLEAR ATMOSPHERE</span>
</div>
<div class="mt-space-xs pt-space-xs border-t border-border-default grid grid-cols-3 gap-space-xs text-text-secondary font-code-sm">
<div>PUNE/MUMBAI CLOUD: <span class="text-text-primary">12.4%</span></div>
<div>RAIN ATTENUATION: <span class="text-text-primary">0.02 dB/km</span></div>
<div>SOLAR FLUX (F10.7): <span class="text-text-primary">148.2 sfu</span></div>
</div>
</div>
<!-- STEP 3 -->
<div class="border border-border-default bg-surface-panel p-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="w-5 h-5 bg-status-nominal-surface border border-status-nominal text-status-nominal flex items-center justify-center font-code-sm text-[10px] font-bold">3</span>
<div>
<span class="font-label-md text-label-md font-semibold text-text-primary uppercase">Multi-Ground Station IQ Demodulation Attestations</span>
<span class="text-text-tertiary ml-space-sm">// 4 SatNOGS Observatories Reporting</span>
</div>
</div>
<span class="border border-status-nominal bg-status-nominal-surface text-status-nominal px-space-xs py-0 text-[10px] font-code-sm uppercase font-semibold">4/4 STATIONS SIGNED</span>
</div>
<div class="mt-space-xs pt-space-xs border-t border-border-default text-text-secondary font-code-sm">
<div class="flex justify-between items-center text-[11px] mb-1">
<span>DEMOD STATUS: <span class="text-status-nominal font-semibold">DVB-S2 QPSK RATE 3/4 SYNCHRONIZED</span></span>
<span>PACKET COMPLIANCE: <span class="text-text-primary font-semibold">99.91%</span></span>
</div>
<div class="grid grid-cols-4 gap-1 text-[10px]">
<div class="p-1 bg-surface-inset border border-border-default">Node #189 BLR: <span class="text-status-nominal">SIG_OK</span></div>
<div class="p-1 bg-surface-inset border border-border-default">Node #244 HYD: <span class="text-status-nominal">SIG_OK</span></div>
<div class="p-1 bg-surface-inset border border-border-default">Node #312 CMB: <span class="text-status-nominal">SIG_OK</span></div>
<div class="p-1 bg-surface-inset border border-border-default">Node #402 MCT: <span class="text-status-nominal">SIG_OK</span></div>
</div>
</div>
</div>
<!-- STEP 4 -->
<div class="border border-border-default bg-surface-panel p-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="w-5 h-5 bg-status-nominal-surface border border-status-nominal text-status-nominal flex items-center justify-center font-code-sm text-[10px] font-bold">4</span>
<div>
<span class="font-label-md text-label-md font-semibold text-text-primary uppercase">Telemetry Oracle Quorum Consensus</span>
<span class="text-text-tertiary ml-space-sm">// Chainlink Functions DON Off-Chain Compute</span>
</div>
</div>
<span class="border border-status-nominal bg-status-nominal-surface text-status-nominal px-space-xs py-0 text-[10px] font-code-sm uppercase font-semibold">QUORUM 5/7 REACHED</span>
</div>
<div class="mt-space-xs pt-space-xs border-t border-border-default grid grid-cols-3 gap-space-xs text-text-secondary font-code-sm">
<div>MEAN THROUGHPUT: <span class="text-text-primary font-semibold">48.2 Mbps (Req: 45.0)</span></div>
<div>BIT ERROR RATE: <span class="text-text-primary font-semibold">< 10^-6</span></div>
<div>MERKLE ROOT: <span class="text-hash-spectral">0x9f4a...e81c</span></div>
</div>
</div>
<!-- STEP 5 -->
<div class="border border-primary border-dashed bg-surface-inset p-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="w-5 h-5 bg-status-active-surface border border-status-active text-status-active flex items-center justify-center font-code-sm text-[10px] font-bold">5</span>
<div>
<span class="font-label-md text-label-md font-semibold text-text-primary uppercase">Smart Contract Automated Release</span>
<span class="text-text-tertiary ml-space-sm">// Sepolia ERC-20 Clearing Vault</span>
</div>
</div>
<span class="border border-primary bg-surface-panel text-primary px-space-xs py-0 text-[10px] font-code-sm uppercase font-semibold">AWAITING TRIGGER</span>
</div>
<div class="mt-space-xs pt-space-xs border-t border-border-default flex items-center justify-between text-text-secondary font-code-sm">
<div>PAYOUT TARGET: <span class="text-text-primary font-mono">0x4f2a9B10935cf198Ae2D3E71c1fB0E687779c1e</span></div>
<div>NET AMOUNT: <span class="text-status-nominal font-bold">12,500.00 USDC</span></div>
</div>
</div>
</div>
<!-- DETAILED RF OBSERVATION GRID -->
<div class="mt-space-xs bg-surface-panel border border-border-default">
<div class="h-7 bg-surface-inset px-space-sm border-b border-border-default flex items-center justify-between">
<span class="font-label-sm text-label-sm font-semibold uppercase text-text-secondary tracking-wider">SatNOGS Demodulation Matrix (Ground Trace Array)</span>
<span class="font-code-sm text-code-sm text-text-tertiary">POLL RATE: 500ms</span>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left font-code-sm text-code-sm border-collapse">
<thead>
<tr class="bg-surface-inset text-text-tertiary border-b border-border-default h-6 font-label-sm uppercase">
<th class="px-space-sm py-1 font-medium">Node ID / Ground Target</th>
<th class="px-space-sm py-1 font-medium">Center Freq</th>
<th class="px-space-sm py-1 font-medium text-right">Mean SNR</th>
<th class="px-space-sm py-1 font-medium text-right">Packets Recv/Drop</th>
<th class="px-space-sm py-1 font-medium">GPG Signature Verification</th>
</tr>
</thead>
<tbody class="divide-y divide-border-default">
<tr class="hover:bg-surface-inset">
<td class="px-space-sm py-1 text-text-primary flex items-center gap-space-xs">
<span class="w-1.5 h-1.5 bg-status-nominal"></span>
                    #189 Bangalore, IN [UHF/S]
                  </td>
<td class="px-space-sm py-1 text-text-secondary">2245.500 MHz</td>
<td class="px-space-sm py-1 text-right text-status-nominal font-semibold">+18.4 dB</td>
<td class="px-space-sm py-1 text-right text-text-primary">14,280 / 12</td>
<td class="px-space-sm py-1 text-hash-spectral font-mono text-[10px]">SHA256:0x49e...c7a1 <span class="text-status-nominal">[VALID]</span></td>
</tr>
<tr class="hover:bg-surface-inset">
<td class="px-space-sm py-1 text-text-primary flex items-center gap-space-xs">
<span class="w-1.5 h-1.5 bg-status-nominal"></span>
                    #244 Hyderabad, IN [S-Band 3.0m]
                  </td>
<td class="px-space-sm py-1 text-text-secondary">2245.500 MHz</td>
<td class="px-space-sm py-1 text-right text-status-nominal font-semibold">+19.1 dB</td>
<td class="px-space-sm py-1 text-right text-text-primary">14,291 / 1</td>
<td class="px-space-sm py-1 text-hash-spectral font-mono text-[10px]">SHA256:0x87a...f01b <span class="text-status-nominal">[VALID]</span></td>
</tr>
<tr class="hover:bg-surface-inset">
<td class="px-space-sm py-1 text-text-primary flex items-center gap-space-xs">
<span class="w-1.5 h-1.5 bg-status-nominal"></span>
                    #312 Colombo, LK [Tracking Helical]
                  </td>
<td class="px-space-sm py-1 text-text-secondary">2245.500 MHz</td>
<td class="px-space-sm py-1 text-right text-status-nominal font-semibold">+17.8 dB</td>
<td class="px-space-sm py-1 text-right text-text-primary">14,265 / 27</td>
<td class="px-space-sm py-1 text-hash-spectral font-mono text-[10px]">SHA256:0xb02...93aa <span class="text-status-nominal">[VALID]</span></td>
</tr>
<tr class="hover:bg-surface-inset">
<td class="px-space-sm py-1 text-text-primary flex items-center gap-space-xs">
<span class="w-1.5 h-1.5 bg-status-nominal"></span>
                    #402 Muscat, OM [Grid S-Band]
                  </td>
<td class="px-space-sm py-1 text-text-secondary">2245.500 MHz</td>
<td class="px-space-sm py-1 text-right text-status-nominal font-semibold">+16.9 dB</td>
<td class="px-space-sm py-1 text-right text-text-primary">14,210 / 82</td>
<td class="px-space-sm py-1 text-hash-spectral font-mono text-[10px]">SHA256:0xe31...88c4 <span class="text-status-nominal">[VALID]</span></td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- RAW TLE LINE 1 & 2 INSPECTOR -->
<div class="bg-canvas-base border border-border-default p-space-sm">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">RAW TWO-LINE ELEMENT (TLE) SGP4 ORBIT SPECIFICATION</span>
<span class="font-code-sm text-[10px] text-text-secondary">EPOCH: 2025.102.77918841 UTC</span>
</div>
<div class="p-space-xs bg-surface-panel border border-border-default font-code-sm text-code-sm text-text-secondary space-y-0.5 select-all">
<div class="text-primary font-mono">1 58214U 23180A   25102.77918841  .00008412  00000-0  54012-3 0  9998</div>
<div class="text-primary font-mono">2 58214  97.4812 189.4210 0012014  78.4120 281.7104 15.14892110 74125</div>
</div>
</div>
<!-- SMART CONTRACT ACTION & SETTLEMENT TRIGGER BAR -->
<div class="mt-space-xs bg-surface-panel border border-border-default p-space-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">SMART CONTRACT ESCROW ACTION</span>
<span class="font-label-md text-label-md text-text-primary font-semibold">Release Condition: DON Quorum >= 5 Verified</span>
</div>
<div class="flex flex-wrap items-center gap-space-sm">
<button class="h-8 px-space-md bg-status-active hover:bg-primary-container text-canvas-base font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-1 transition-none" id="btn-settle" onclick="triggerSettlement()">
<span class="material-symbols-outlined text-[16px]">send_money</span>
              EXECUTE SETTLEMENT PAYOUT
            </button>
<button class="h-8 px-space-sm bg-surface-inset hover:bg-status-breach-surface border border-status-breach text-status-breach font-label-sm text-label-sm uppercase flex items-center gap-1 transition-none" onclick="triggerDispute()">
<span class="material-symbols-outlined text-[15px]">flag</span>
              SLASH BOND / DISPUTE
            </button>
</div>
</div>
<!-- SECONDARY ON-CHAIN AUDIT LINKS -->
<div class="flex flex-wrap items-center justify-between gap-space-xs text-text-tertiary font-code-sm text-[11px] pt-space-xs">
<div class="flex items-center gap-space-sm">
<a class="hover:text-primary underline flex items-center gap-0.5" href="#">
<span>View Sepolia Etherscan Tx</span>
<span class="material-symbols-outlined text-[12px]">open_in_new</span>
</a>
<span>•</span>
<a class="hover:text-hash-spectral underline flex items-center gap-0.5" href="#">
<span>IPFS CID: bafybeic9x07...2a8f (CAR Payload)</span>
<span class="material-symbols-outlined text-[12px]">dataset</span>
</a>
</div>
<div>SIGNER QUORUM: 0x3d...4b | 0x8f...12 | 0x22...aa</div>
</div>
</div>
</section>
<!-- RIGHT DECK: MODULAR TELEMETRY & ORACLE INSPECTOR PANELS (XL: 38% -> col-span-5) -->
<section class="xl:col-span-5 bg-surface-panel flex flex-col divide-y divide-border-default">
<!-- PANEL 1: SatNOGS RF SIGNAL & WATERFALL DOPPLER TRACKER -->
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-primary">ssid_chart</span>
<span class="font-label-md text-label-md font-semibold uppercase text-text-primary tracking-wider">SatNOGS RF Signal & Doppler Waterfall</span>
</div>
<span class="border border-status-nominal bg-status-nominal-surface text-status-nominal px-space-xs py-0 text-[10px] font-code-sm uppercase font-semibold">CARRIER LOCKED</span>
</div>
<!-- ASCII/Monospace Doppler Visualizer -->
<div class="bg-canvas-base border border-border-default p-space-sm font-code-sm text-code-sm">
<div class="flex justify-between text-text-tertiary text-[10px] border-b border-border-default pb-1 mb-1">
<span>FREQ: 2245.5000 MHz</span>
<span>BW: 10.0 MHz</span>
<span class="text-status-nominal">DOPPLER: -1.42 kHz</span>
</div>
<!-- Synthetic Frequency Waterfall Matrix -->
<div class="space-y-0.5 font-mono text-[10px] text-text-secondary leading-none py-1 overflow-hidden select-none">
<div class="flex justify-between"><span class="text-text-tertiary">18:41:00</span> <span class="text-primary font-bold">....|....|....[####|###]....|....</span> <span class="text-text-tertiary">+4.2 kHz</span></div>
<div class="flex justify-between"><span class="text-text-tertiary">18:43:30</span> <span class="text-primary font-bold">....|....|...[#####|###]...|....</span> <span class="text-text-tertiary">+2.8 kHz</span></div>
<div class="flex justify-between"><span class="text-text-tertiary">18:46:12</span> <span class="text-status-nominal font-bold">....|....|..[######|####]..|....</span> <span class="text-status-nominal">0.0 kHz (TCA)</span></div>
<div class="flex justify-between"><span class="text-text-tertiary">18:49:00</span> <span class="text-primary font-bold">....|....|.[#######|###]...|....</span> <span class="text-text-tertiary">-2.1 kHz</span></div>
<div class="flex justify-between"><span class="text-text-tertiary">18:52:14</span> <span class="text-text-secondary">....|....|..[#####|##].....|....</span> <span class="text-text-tertiary">-3.8 kHz</span></div>
</div>
<!-- Doppler Shift Bar -->
<div class="mt-2 pt-2 border-t border-border-default flex items-center justify-between text-[11px]">
<span class="text-text-tertiary">Constellation SNR:</span>
<div class="w-48 bg-surface-inset h-2 border border-border-default overflow-hidden relative">
<div class="bg-status-nominal h-full" style="width: 88%;"></div>
</div>
<span class="text-status-nominal font-semibold">18.4 dB</span>
</div>
</div>
<!-- Real-Time Packet Stream Log Container -->
<div class="flex flex-col">
<div class="flex justify-between text-[10px] font-label-sm text-text-tertiary uppercase pb-1">
<span>Live Packet Ingest Stream</span>
<span>CRC: 100% PASS</span>
</div>
<div class="bg-canvas-base border border-border-default p-space-xs h-24 overflow-y-auto font-code-sm text-[10px] text-text-secondary space-y-0.5" id="packet-log">
<div class="text-text-tertiary">[18:52:12.012] <span class="text-status-nominal">FRAME #14278</span> HDR:0x22F4 SYNC:1 FEC:OK BER:1.2e-7 [BLR-189]</div>
<div class="text-text-tertiary">[18:52:12.894] <span class="text-status-nominal">FRAME #14279</span> HDR:0x22F4 SYNC:1 FEC:OK BER:1.1e-7 [HYD-244]</div>
<div class="text-text-tertiary">[18:52:13.411] <span class="text-status-nominal">FRAME #14280</span> HDR:0x22F4 SYNC:1 FEC:OK BER:1.4e-7 [CMB-312]</div>
<div class="text-primary font-semibold">[18:52:14.000] >> LOS SIGNAL TERMINATION DETECTED. FINALIZING CAR ARCHIVE.</div>
</div>
</div>
</div>
<!-- PANEL 2: CHAINLINK FUNCTIONS DON VERIFICATION BREAKDOWN -->
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-primary">device_hub</span>
<span class="font-label-md text-label-md font-semibold uppercase text-text-primary tracking-wider">Chainlink Functions DON Consensus (7 Nodes)</span>
</div>
<span class="font-code-sm text-code-sm text-primary font-semibold">DON ID: #0421-SEPOLIA</span>
</div>
<!-- 7-Node Consensus Table -->
<div class="overflow-x-auto border border-border-default">
<table class="w-full text-left font-code-sm text-[11px] border-collapse">
<thead>
<tr class="bg-surface-inset text-text-tertiary border-b border-border-default h-5 font-label-sm uppercase">
<th class="px-space-xs py-0.5">Node ID / PubKey</th>
<th class="px-space-xs py-0.5">Reported Hash</th>
<th class="px-space-xs py-0.5 text-right">Ping</th>
<th class="px-space-xs py-0.5 text-center">Vote</th>
</tr>
</thead>
<tbody class="divide-y divide-border-default bg-canvas-base">
<tr>
<td class="px-space-xs py-1 text-text-primary font-mono">DON-01 (0x81...32)</td>
<td class="px-space-xs py-1 text-text-secondary font-mono">0x9f4a...e81c</td>
<td class="px-space-xs py-1 text-right text-status-nominal">42ms</td>
<td class="px-space-xs py-1 text-center"><span class="text-status-nominal font-bold">AGREE</span></td>
</tr>
<tr>
<td class="px-space-xs py-1 text-text-primary font-mono">DON-02 (0xb4...19)</td>
<td class="px-space-xs py-1 text-text-secondary font-mono">0x9f4a...e81c</td>
<td class="px-space-xs py-1 text-right text-status-nominal">38ms</td>
<td class="px-space-xs py-1 text-center"><span class="text-status-nominal font-bold">AGREE</span></td>
</tr>
<tr>
<td class="px-space-xs py-1 text-text-primary font-mono">DON-03 (0xcc...90)</td>
<td class="px-space-xs py-1 text-text-secondary font-mono">0x9f4a...e81c</td>
<td class="px-space-xs py-1 text-right text-status-nominal">49ms</td>
<td class="px-space-xs py-1 text-center"><span class="text-status-nominal font-bold">AGREE</span></td>
</tr>
<tr>
<td class="px-space-xs py-1 text-text-primary font-mono">DON-04 (0x17...6a)</td>
<td class="px-space-xs py-1 text-text-secondary font-mono">0x9f4a...e81c</td>
<td class="px-space-xs py-1 text-right text-status-nominal">51ms</td>
<td class="px-space-xs py-1 text-center"><span class="text-status-nominal font-bold">AGREE</span></td>
</tr>
<tr>
<td class="px-space-xs py-1 text-text-primary font-mono">DON-05 (0x59...ee)</td>
<td class="px-space-xs py-1 text-text-secondary font-mono">0x9f4a...e81c</td>
<td class="px-space-xs py-1 text-right text-status-nominal">44ms</td>
<td class="px-space-xs py-1 text-center"><span class="text-status-nominal font-bold">AGREE</span></td>
</tr>
<tr class="opacity-60 bg-surface-inset">
<td class="px-space-xs py-1 text-text-secondary font-mono">DON-06 (0xaa...81)</td>
<td class="px-space-xs py-1 text-text-tertiary font-mono">0x0000...0000</td>
<td class="px-space-xs py-1 text-right text-status-pending">timeout</td>
<td class="px-space-xs py-1 text-center"><span class="text-text-tertiary">PENDING</span></td>
</tr>
<tr class="opacity-60 bg-surface-inset">
<td class="px-space-xs py-1 text-text-secondary font-mono">DON-07 (0x33...02)</td>
<td class="px-space-xs py-1 text-text-tertiary font-mono">0x0000...0000</td>
<td class="px-space-xs py-1 text-right text-status-pending">timeout</td>
<td class="px-space-xs py-1 text-center"><span class="text-text-tertiary">PENDING</span></td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- PANEL 3: REGULATORY SPECTRUM COMPLIANCE (FCC IBFS & ITU SYNC) -->
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-primary">policy</span>
<span class="font-label-md text-label-md font-semibold uppercase text-text-primary tracking-wider">Spectrum Compliance (FCC / ITU)</span>
</div>
<span class="border border-status-nominal bg-status-nominal-surface text-status-nominal px-space-xs py-0 text-[10px] font-code-sm uppercase font-semibold">IBFS SYNCED</span>
</div>
<div class="grid grid-cols-2 gap-space-xs font-code-sm text-code-sm">
<div class="bg-surface-inset border border-border-default p-space-xs">
<div class="text-text-tertiary text-[10px] uppercase">FCC CALL SIGN</div>
<div class="text-text-primary font-bold">WH9XST</div>
<div class="text-text-secondary text-[10px]">AUTH: EXPERIMENTAL SPACE</div>
</div>
<div class="bg-surface-inset border border-border-default p-space-xs">
<div class="text-text-tertiary text-[10px] uppercase">ALLOCATED BAND</div>
<div class="text-text-primary font-bold">2200 - 2290 MHz</div>
<div class="text-text-secondary text-[10px]">ITU RR ARTICLE 21 COMPLIANT</div>
</div>
<div class="bg-surface-inset border border-border-default p-space-xs">
<div class="text-text-tertiary text-[10px] uppercase">MAX EIRP SPECTRAL DENSITY</div>
<div class="text-text-primary font-bold">-38.2 dBW/4kHz</div>
<div class="text-status-nominal text-[10px]">WITHIN LIMITS (-36.0 MAX)</div>
</div>
<div class="bg-surface-inset border border-border-default p-space-xs">
<div class="text-text-tertiary text-[10px] uppercase">ORBITAL DEBRIS MITIGATION</div>
<div class="text-text-primary font-bold">ODMSP REV-A</div>
<div class="text-status-nominal text-[10px]">NOAA LICENSE #2023-SP-88</div>
</div>
</div>
</div>
<!-- PANEL 4: ESCROW SLASHER BOND & OPERATOR COLLATERAL DECK -->
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-status-nominal">shield</span>
<span class="font-label-md text-label-md font-semibold uppercase text-text-primary tracking-wider">Operator Collateral & Slasher Bond</span>
</div>
<span class="font-code-sm text-code-sm text-status-nominal font-semibold">STAKE SECURE</span>
</div>
<div class="bg-surface-inset border border-border-default p-space-sm flex flex-col gap-space-xs">
<div class="flex justify-between items-center font-label-sm text-label-sm">
<span class="text-text-tertiary uppercase">Orbitex Staked Security Bond:</span>
<span class="font-code-md text-headline-sm text-text-primary font-bold">50,000.00 USDC</span>
</div>
<div class="flex justify-between items-center text-[11px] font-code-sm">
<span class="text-text-secondary">Contract SLA Delivery Requirement:</span>
<span class="text-text-primary font-semibold">99.0% Frame Delivery</span>
</div>
<div class="flex justify-between items-center text-[11px] font-code-sm">
<span class="text-text-secondary">Actual Verified Station Throughput:</span>
<span class="text-status-nominal font-bold">99.4% (+0.4% DELTA)</span>
</div>
<!-- SLA Bar indicator -->
<div class="w-full bg-canvas-base h-2 border border-border-default mt-1 overflow-hidden">
<div class="bg-status-nominal h-full" style="width: 99.4%;"></div>
</div>
<div class="flex justify-between text-[10px] font-label-sm text-text-tertiary pt-1">
<span>Slasher Penalty: 100% Staked Burn</span>
<span class="text-status-nominal font-semibold">ZERO DISPUTES RECORDED</span>
</div>
</div>
</div>
</section>
</div>
<!-- INTERACTION NOTIFICATION TOAST -->
<div class="hidden fixed bottom-10 right-10 z-50 bg-surface-panel border-2 border-primary p-space-md text-text-primary shadow-2xl max-w-sm" id="status-toast">
<div class="flex items-center gap-space-sm mb-1">
<span class="material-symbols-outlined text-primary text-[18px]">verified</span>
<span class="font-label-md text-label-md font-bold uppercase" id="toast-title">TRANSACTION BROADCAST</span>
</div>
<div class="font-code-sm text-code-sm text-text-secondary" id="toast-body">
      Smart contract settlement triggered on Sepolia network.
    </div>
</div>
<!-- INLINE VANILLA INTERACTIVITY -->
<script>
    function triggerSettlement() {
      const btn = document.getElementById('btn-settle');
      if (!btn) return;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> EXECUTING RELAYER...';
      btn.classList.remove('bg-status-active', 'hover:bg-primary-container');
      btn.classList.add('bg-status-pending', 'text-canvas-base');
      
      setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> SETTLEMENT FINALIZED';
        btn.classList.remove('bg-status-pending');
        btn.classList.add('bg-status-nominal', 'text-canvas-base');
        
        const toast = document.getElementById('status-toast');
        const toastTitle = document.getElementById('toast-title');
        const toastBody = document.getElementById('toast-body');
        if (toast && toastTitle && toastBody) {
          toastTitle.innerText = 'SETTLEMENT RELAY BROADCAST';
          toastBody.innerText = 'Tx Hash: 0x5a18...f89e settled! 12,500 USDC transferred to Orbitex Vault.';
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 5000);
        }
      }, 1500);
    }

    function triggerDispute() {
      const toast = document.getElementById('status-toast');
      const toastTitle = document.getElementById('toast-title');
      const toastBody = document.getElementById('toast-body');
      if (toast && toastTitle && toastBody) {
        toastTitle.innerText = 'DISPUTE CHALLENGE INITIATED';
        toastBody.innerText = 'Bond challenge posted to Arbitrator Court. Requires 5,000 USDC dispute bond.';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
      }
    }
  </script>
</div></main>` }} 
    />
  );
}
