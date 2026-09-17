'use client';
export default function Marketplace() {
  return (
    <div 
      className="select-none h-full w-full"
      dangerouslySetInnerHTML={{ __html: `<main class="relative w-full flex-1 bg-canvas-base"><div class="flex flex-col w-full font-body-md text-text-primary">
<!-- TOP TELEMETRY BENCHMARK BANNER -->
<section class="w-full bg-surface-panel p-space-md shadow-sm mb-space-md">
<div class="grid grid-cols-2 md:grid-cols-5 gap-space-md text-left">
<div class="bg-surface-inset p-space-sm">
<div class="font-label-sm text-label-sm text-text-tertiary flex items-center justify-between">
<span>AVAILABLE PASS WINDOWS</span>
<span class="inline-block w-1.5 h-1.5 bg-status-nominal"></span>
</div>
<div class="font-headline-lg text-headline-lg text-text-primary mt-space-xs font-semibold">112</div>
<div class="font-code-sm text-code-sm text-status-nominal mt-0.5">99.4% VERIFIED TLE</div>
</div>
<div class="bg-surface-inset p-space-sm">
<div class="font-label-sm text-label-sm text-text-tertiary flex items-center justify-between">
<span>AGGREGATE BANDWIDTH</span>
<span class="material-symbols-outlined text-primary text-label-md">speed</span>
</div>
<div class="font-headline-lg text-headline-lg text-primary mt-space-xs font-semibold">4.8 <span class="text-label-md text-text-secondary font-normal">Gbps</span></div>
<div class="font-code-sm text-code-sm text-text-secondary mt-0.5">S / X / Ka POOLED</div>
</div>
<div class="bg-surface-inset p-space-sm">
<div class="font-label-sm text-label-sm text-text-tertiary flex items-center justify-between">
<span>MEAN ESCROW SPOT PRICE</span>
<span class="material-symbols-outlined text-secondary text-label-md">payments</span>
</div>
<div class="font-headline-lg text-headline-lg text-secondary mt-space-xs font-semibold">\$38.40 <span class="text-label-md text-text-secondary font-normal">/ pass</span></div>
<div class="font-code-sm text-code-sm text-status-nominal mt-0.5">-4.2% VS 24H VWAP</div>
</div>
<div class="bg-surface-inset p-space-sm">
<div class="font-label-sm text-label-sm text-text-tertiary flex items-center justify-between">
<span>NEXT APOGEE WINDOW</span>
<span class="inline-block w-1.5 h-1.5 bg-status-pending animate-pulse"></span>
</div>
<div class="font-headline-lg text-headline-lg text-status-pending mt-space-xs font-semibold">04m 12s</div>
<div class="font-code-sm text-code-sm text-text-secondary mt-0.5">LEO CORRIDOR #09</div>
</div>
<div class="bg-surface-inset p-space-sm col-span-2 md:col-span-1">
<div class="font-label-sm text-label-sm text-text-tertiary flex items-center justify-between">
<span>CELESTRAK SGP4 SYNC</span>
<span class="inline-block w-1.5 h-1.5 bg-status-nominal"></span>
</div>
<div class="font-headline-lg text-headline-lg text-status-nominal mt-space-xs font-semibold">NOMINAL</div>
<div class="font-code-sm text-code-sm text-text-tertiary mt-0.5">EPOCH 2025102.778</div>
</div>
</div>
</section>
<!-- NATURAL LANGUAGE QUERY & PARAMETRIC CONSTRAINTS -->
<section class="w-full bg-surface-panel p-space-md mb-space-md shadow-sm">
<div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-space-md">
<div class="flex-1 relative bg-surface-inset">
<div class="absolute left-space-md top-1/2 -translate-y-1/2 flex items-center gap-space-xs text-text-tertiary pointer-events-none">
<span class="material-symbols-outlined text-headline-sm text-primary">terminal</span>
<span class="font-code-sm text-code-sm text-text-tertiary">EXEC></span>
</div>
<input class="w-full bg-transparent pl-20 pr-space-md py-space-sm font-code-md text-code-md text-text-primary placeholder-text-tertiary focus:outline-none focus:bg-surface-container-high transition-colors" id="orbitalQueryInput" placeholder="Query by pass duration, RF band, ground station lat/long, or ephemeris timestamp..." type="text" value="I need 10 minutes of S/X-Band downlink connectivity over South Asia / Indian Ocean corridor tomorrow 06:00-08:00 UTC"/>
</div>
<div class="flex items-center gap-space-xs">
<button class="bg-primary text-on-primary px-space-md py-1.5 font-label-md text-label-md font-semibold flex items-center gap-space-xs hover:bg-primary-fixed transition-colors" id="btnRunQuery">
<span class="material-symbols-outlined text-headline-sm">satellite</span>
<span>QUERY CONSTELLATION</span>
</button>
<button class="bg-surface-inset text-text-secondary px-space-md py-1.5 font-label-md text-label-md hover:text-text-primary hover:bg-surface-container-high transition-colors" id="btnResetFilters">
          CLEAR
        </button>
</div>
</div>
<!-- FILTER CHIPS ROW -->
<div class="flex flex-wrap items-center gap-space-xs mt-space-md pt-space-xs bg-surface-panel">
<span class="font-label-sm text-label-sm text-text-tertiary mr-space-xs uppercase tracking-wider">CONSTRAINTS:</span>
<!-- Band Dropdown Chip -->
<div class="relative inline-block" id="bandFilterContainer">
<button class="bg-surface-inset text-text-primary px-space-sm py-1 font-label-sm text-label-sm flex items-center gap-space-xs hover:bg-surface-container-high">
<span class="text-text-tertiary">BAND:</span>
<span class="text-primary font-semibold" id="activeBandLabel">S-BAND, X-BAND</span>
<span class="material-symbols-outlined text-code-sm text-text-tertiary">expand_more</span>
</button>
</div>
<!-- Min Elevation Chip -->
<button class="bg-surface-inset text-text-primary px-space-sm py-1 font-label-sm text-label-sm flex items-center gap-space-xs hover:bg-surface-container-high">
<span class="text-text-tertiary">MIN EL:</span>
<span class="text-secondary font-semibold">> 25.0°</span>
<span class="material-symbols-outlined text-code-sm text-status-nominal">check</span>
</button>
<!-- Cloud Attenuation Chip -->
<button class="bg-surface-inset text-text-primary px-space-sm py-1 font-label-sm text-label-sm flex items-center gap-space-xs hover:bg-surface-container-high">
<span class="text-text-tertiary">CLOUD ATTN:</span>
<span class="text-status-pending font-semibold">< 15.0%</span>
<span class="material-symbols-outlined text-code-sm text-status-nominal">check</span>
</button>
<!-- Staked Collateral Chip -->
<button class="bg-surface-inset text-text-primary px-space-sm py-1 font-label-sm text-label-sm flex items-center gap-space-xs hover:bg-surface-container-high">
<span class="text-text-tertiary">SLASH STAKE:</span>
<span class="text-hash-spectral font-semibold">> \$20,000 USDC</span>
<span class="material-symbols-outlined text-code-sm text-status-nominal">verified</span>
</button>
<!-- Ground Target Selector -->
<div class="ml-auto flex items-center gap-space-xs bg-surface-inset px-space-sm py-1">
<span class="material-symbols-outlined text-label-sm text-status-nominal">location_on</span>
<span class="font-label-sm text-label-sm text-text-tertiary">GROUND VECTOR:</span>
<span class="font-code-sm text-code-sm text-text-primary">INDIAN OCEAN / ISRO 13.03N 77.51E</span>
</div>
</div>
</section>
<!-- MAIN COCKPIT WORKSPACE: SPOT ORDER BOOK + RIGHT INSPECTION DOCK -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start w-full">
<!-- LEFT & CENTER: PASS SPOT MARKET LEDGER (COL 8) -->
<div class="lg:col-span-8 flex flex-col gap-space-md">
<div class="bg-surface-panel shadow-sm">
<!-- Panel Head -->
<div class="bg-surface-inset px-space-md py-space-sm flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-primary text-headline-sm">table_rows</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-semibold">LIVE SPOT PASS CANDIDATES (4 RANKED MATCHES)</span>
</div>
<div class="flex items-center gap-space-md font-label-sm text-label-sm">
<span class="text-text-tertiary">SORT: <strong class="text-text-primary font-normal">COMPOSITE QOS / PRICE</strong></span>
<span class="inline-flex items-center gap-1 text-status-nominal"><span class="w-1.5 h-1.5 bg-status-nominal"></span>FEED ACTIVE</span>
</div>
</div>
<!-- Ledger Table -->
<div class="w-full overflow-x-auto">
<table class="w-full text-left font-body-sm text-body-sm">
<thead>
<tr class="bg-surface-inset text-text-tertiary font-label-sm text-label-sm tracking-wider">
<th class="px-space-md py-2 font-medium">PASS ID</th>
<th class="px-space-md py-2 font-medium">SAT / NORAD</th>
<th class="px-space-md py-2 font-medium">ORBIT</th>
<th class="px-space-md py-2 font-medium">AOS - LOS (UTC)</th>
<th class="px-space-md py-2 font-medium text-right">MAX EL</th>
<th class="px-space-md py-2 font-medium">RF SPECTRUM</th>
<th class="px-space-md py-2 font-medium text-right">THROUGHPUT</th>
<th class="px-space-md py-2 font-medium text-right">SPOT PRICE</th>
<th class="px-space-md py-2 font-medium text-center">COLLATERAL</th>
<th class="px-space-md py-2 font-medium text-center">WEATHER</th>
<th class="px-space-md py-2 font-medium text-right">SETTLEMENT</th>
</tr>
</thead>
<tbody class="divide-y-0" id="passLedgerBody">
<!-- ROW 1 (DEFAULT SELECTED) -->
<tr class="hover:bg-surface-inset cursor-pointer bg-surface-inset transition-colors" data-pass-id="OA-1042">
<td class="px-space-md py-space-sm font-code-sm text-code-sm text-primary font-semibold">#OA-1042</td>
<td class="px-space-md py-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary leading-tight">ORBITEX SAT-07</div>
<div class="font-code-sm text-code-sm text-text-tertiary">NORAD #55124 // OPERATOR: ORBITEX CORP</div>
</td>
<td class="px-space-md py-space-sm">
<span class="bg-surface-panel px-space-xs py-0.5 text-text-secondary font-label-sm text-label-sm">550km SSO</span>
</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<span class="text-text-primary">06:42:10</span> - <span class="text-text-primary">06:52:45</span>
<div class="text-text-tertiary">10m 35s DUR</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-secondary font-semibold">74.8°</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<div class="text-primary font-semibold">S-BAND</div>
<div class="text-text-tertiary text-label-sm">2245.500 MHz</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-text-primary">32 Mbps</td>
<td class="px-space-md py-space-sm text-right">
<div class="font-code-md text-code-md text-secondary font-bold">\$41.00</div>
<div class="font-label-sm text-label-sm text-text-tertiary">USDC</div>
</td>
<td class="px-space-md py-space-sm text-center">
<span class="bg-status-nominal-surface text-status-nominal font-code-sm text-code-sm px-space-xs py-0.5 font-semibold">120% STAKED</span>
</td>
<td class="px-space-md py-space-sm text-center">
<div class="flex items-center justify-center gap-1 font-code-sm text-code-sm text-status-nominal">
<span class="w-1.5 h-1.5 bg-status-nominal"></span>
<span>1.2%</span>
</div>
</td>
<td class="px-space-md py-space-sm text-right">
<button class="bg-primary text-on-primary px-space-sm py-1 font-label-sm text-label-sm uppercase font-semibold hover:bg-primary-fixed transition-colors">
                    LOCK ESCROW
                  </button>
</td>
</tr>
<!-- ROW 2 -->
<tr class="hover:bg-surface-inset cursor-pointer transition-colors" data-pass-id="OA-1048">
<td class="px-space-md py-space-sm font-code-sm text-code-sm text-primary font-semibold">#OA-1048</td>
<td class="px-space-md py-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary leading-tight">MERIDIAN METEOSAT-X</div>
<div class="font-code-sm text-code-sm text-text-tertiary">NORAD #48911 // OPERATOR: MERIDIAN GEO</div>
</td>
<td class="px-space-md py-space-sm">
<span class="bg-surface-panel px-space-xs py-0.5 text-text-secondary font-label-sm text-label-sm">480km POLAR</span>
</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<span class="text-text-primary">07:11:05</span> - <span class="text-text-primary">07:22:18</span>
<div class="text-text-tertiary">11m 13s DUR</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-secondary font-semibold">62.1°</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<div class="text-hash-spectral font-semibold">X-BAND</div>
<div class="text-text-tertiary text-label-sm">8150.000 MHz</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-text-primary">150 Mbps</td>
<td class="px-space-md py-space-sm text-right">
<div class="font-code-md text-code-md text-secondary font-bold">\$85.00</div>
<div class="font-label-sm text-label-sm text-text-tertiary">USDC</div>
</td>
<td class="px-space-md py-space-sm text-center">
<span class="bg-status-nominal-surface text-status-nominal font-code-sm text-code-sm px-space-xs py-0.5 font-semibold">200% STAKED</span>
</td>
<td class="px-space-md py-space-sm text-center">
<div class="flex items-center justify-center gap-1 font-code-sm text-code-sm text-status-pending">
<span class="w-1.5 h-1.5 bg-status-pending"></span>
<span>4.8%</span>
</div>
</td>
<td class="px-space-md py-space-sm text-right">
<button class="bg-surface-container text-text-primary px-space-sm py-1 font-label-sm text-label-sm uppercase font-semibold hover:bg-primary hover:text-on-primary transition-colors">
                    LOCK ESCROW
                  </button>
</td>
</tr>
<!-- ROW 3 -->
<tr class="hover:bg-surface-inset cursor-pointer transition-colors" data-pass-id="OA-1052">
<td class="px-space-md py-space-sm font-code-sm text-code-sm text-primary font-semibold">#OA-1052</td>
<td class="px-space-md py-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary leading-tight">HELIOSAT CUBE-4</div>
<div class="font-code-sm text-code-sm text-text-tertiary">NORAD #53109 // OPERATOR: HELIO LABS</div>
</td>
<td class="px-space-md py-space-sm">
<span class="bg-surface-panel px-space-xs py-0.5 text-text-secondary font-label-sm text-label-sm">510km LEO</span>
</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<span class="text-text-primary">05:58:30</span> - <span class="text-text-primary">06:08:42</span>
<div class="text-text-tertiary">10m 12s DUR</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-secondary font-semibold">41.5°</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<div class="text-primary font-semibold">UHF / S</div>
<div class="text-text-tertiary text-label-sm">2210.000 MHz</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-text-primary">20 Mbps</td>
<td class="px-space-md py-space-sm text-right">
<div class="font-code-md text-code-md text-secondary font-bold">\$24.00</div>
<div class="font-label-sm text-label-sm text-text-tertiary">USDC</div>
</td>
<td class="px-space-md py-space-sm text-center">
<span class="bg-status-active-surface text-status-active font-code-sm text-code-sm px-space-xs py-0.5 font-semibold">100% STAKED</span>
</td>
<td class="px-space-md py-space-sm text-center">
<div class="flex items-center justify-center gap-1 font-code-sm text-code-sm text-status-nominal">
<span class="w-1.5 h-1.5 bg-status-nominal"></span>
<span>0.0%</span>
</div>
</td>
<td class="px-space-md py-space-sm text-right">
<button class="bg-surface-container text-text-primary px-space-sm py-1 font-label-sm text-label-sm uppercase font-semibold hover:bg-primary hover:text-on-primary transition-colors">
                    LOCK ESCROW
                  </button>
</td>
</tr>
<!-- ROW 4 -->
<tr class="hover:bg-surface-inset cursor-pointer transition-colors" data-pass-id="OA-1059">
<td class="px-space-md py-space-sm font-code-sm text-code-sm text-primary font-semibold">#OA-1059</td>
<td class="px-space-md py-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary leading-tight">NORDIC SYNTH-APERTURE-02</div>
<div class="font-code-sm text-code-sm text-text-tertiary">NORAD #56488 // OPERATOR: NORDIC SAR AG</div>
</td>
<td class="px-space-md py-space-sm">
<span class="bg-surface-panel px-space-xs py-0.5 text-text-secondary font-label-sm text-label-sm">570km DAWN-DUSK</span>
</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<span class="text-text-primary">08:30:00</span> - <span class="text-text-primary">08:44:15</span>
<div class="text-text-tertiary">14m 15s DUR</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-secondary font-semibold">82.4°</td>
<td class="px-space-md py-space-sm font-code-sm text-code-sm">
<div class="text-tertiary font-semibold">Ka-BAND</div>
<div class="text-text-tertiary text-label-sm">26500.00 MHz</div>
</td>
<td class="px-space-md py-space-sm text-right font-code-sm text-code-sm text-text-primary">300 Mbps</td>
<td class="px-space-md py-space-sm text-right">
<div class="font-code-md text-code-md text-secondary font-bold">\$140.00</div>
<div class="font-label-sm text-label-sm text-text-tertiary">USDC</div>
</td>
<td class="px-space-md py-space-sm text-center">
<span class="bg-status-nominal-surface text-status-nominal font-code-sm text-code-sm px-space-xs py-0.5 font-semibold">250% STAKED</span>
</td>
<td class="px-space-md py-space-sm text-center">
<div class="flex items-center justify-center gap-1 font-code-sm text-code-sm text-text-secondary">
<span class="w-1.5 h-1.5 bg-status-nominal"></span>
<span>SAR RAW</span>
</div>
</td>
<td class="px-space-md py-space-sm text-right">
<button class="bg-surface-container text-text-primary px-space-sm py-1 font-label-sm text-label-sm uppercase font-semibold hover:bg-primary hover:text-on-primary transition-colors">
                    LOCK ESCROW
                  </button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Table Footer / Telemetry Bar -->
<div class="bg-surface-panel px-space-md py-space-xs flex flex-wrap items-center justify-between font-code-sm text-code-sm text-text-tertiary">
<div class="flex items-center gap-space-md">
<span>MEMPOOL STATUS: <span class="text-status-nominal font-semibold">0 CONFLICTS</span></span>
<span>DON SLASHER RATIO: <span class="text-text-primary">1:1.8 COLLATERALIZED</span></span>
</div>
<div class="flex items-center gap-space-sm">
<span>SHOWING 4 OF 112 DISCOVERABLE WINDOWS</span>
</div>
</div>
</div>
<!-- SATELLITE TELEMETRY & SPECTRUM PROFILE CARD -->
<div class="bg-surface-panel p-space-md shadow-sm">
<div class="flex items-center justify-between pb-space-sm mb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-hash-spectral">graphic_eq</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-semibold">PASS RF PROFILE & DOPPLER SHIFT CURVE</span>
</div>
<span class="font-code-sm text-code-sm text-text-secondary">SELECTED: #OA-1042 // ORBITEX SAT-07</span>
</div>
<!-- RF Waterfall Simulation / Visualizer Bar -->
<div class="w-full bg-surface-inset p-space-sm relative overflow-hidden">
<div class="flex justify-between font-code-sm text-code-sm text-text-tertiary mb-space-xs">
<span>Fc - 50.0 kHz (2245.450 MHz)</span>
<span class="text-primary font-semibold">CENTER FREQ: 2245.500 MHz (RHCP POLARIZATION)</span>
<span>Fc + 50.0 kHz (2245.550 MHz)</span>
</div>
<!-- Inline Doppler & Signal Strength Visualizer -->
<div class="h-28 w-full bg-canvas-base relative flex items-center justify-center p-space-xs">
<!-- Simulated Spectrum Grid Lines -->
<div class="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-20">
<div class="bg-surface-container"></div><div class="bg-surface-container"></div>
<div class="bg-surface-container"></div><div class="bg-surface-container"></div>
<div class="bg-surface-container"></div><div class="bg-surface-container"></div>
</div>
<svg class="w-full h-full preserve-3d" fill="none" viewbox="0 0 800 100">
<!-- Grid line markers -->
<line stroke="#1F2433" stroke-dasharray="4 4" stroke-width="1" x1="0" x2="800" y1="50" y2="50"></line>
<line stroke="#1F2433" stroke-width="1" x1="400" x2="400" y1="0" y2="100"></line>
<!-- S-Curve Doppler Track -->
<path d="M 50 15 C 200 15, 300 35, 400 50 C 500 65, 600 85, 750 85" stroke="#3B82F6" stroke-width="2.5"></path>
<!-- SNR Power envelope gradient -->
<path d="M 50 95 Q 400 10, 750 95" fill="rgba(78, 222, 163, 0.08)" stroke="#4edea3" stroke-width="1.5"></path>
<!-- Current Predicted Elevation Point -->
<circle class="animate-pulse" cx="400" cy="50" fill="#adc6ff" r="5"></circle>
</svg>
<!-- Annotation overlay -->
<div class="absolute right-space-md top-space-xs font-code-sm text-code-sm text-secondary bg-surface-panel px-space-xs py-0.5">
              MAX SNR: +18.4 dB-Hz
            </div>
<div class="absolute left-space-md bottom-space-xs font-code-sm text-code-sm text-text-tertiary">
              DOPPLER DELTA: +38.2 kHz -> -38.2 kHz
            </div>
</div>
<div class="flex items-center justify-between mt-space-xs font-label-sm text-label-sm text-text-tertiary">
<span>MODULATION: QPSK / DVB-S2X</span>
<span>EIRP: 14.5 dBW</span>
<span>ENCRYPTION: AES-GCM-256 SESSION KEY EXCHANGE</span>
</div>
</div>
</div>
</div>
<!-- RIGHT DECK: SIDE INSPECTION PANEL & ESCROW CONTRACT ESTIMATOR (COL 4) -->
<div class="lg:col-span-4 flex flex-col gap-space-md">
<!-- GROUND TRACK & POLAR ELEVATION CHART -->
<div class="bg-surface-panel shadow-sm p-space-md">
<div class="flex items-center justify-between pb-space-sm mb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-status-nominal">radar</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-semibold">AZ / EL POLAR GROUND TRACK</span>
</div>
<span class="font-code-sm text-code-sm text-status-nominal">ISRO-BLR GS</span>
</div>
<div class="bg-surface-inset p-space-md flex flex-col items-center">
<!-- POLAR AZIMUTH RADAR SVG -->
<div class="relative w-56 h-56 flex items-center justify-center">
<svg class="w-full h-full" fill="none" viewbox="0 0 200 200">
<!-- Outer Azimuth Ring -->
<circle cx="100" cy="100" r="95" stroke="#1F2433" stroke-width="1.5"></circle>
<!-- Elevation Rings (30°, 60°) -->
<circle cx="100" cy="100" r="63" stroke="#1F2433" stroke-dasharray="3 3" stroke-width="1"></circle>
<circle cx="100" cy="100" r="32" stroke="#1F2433" stroke-dasharray="3 3" stroke-width="1"></circle>
<!-- Zenith Center Point -->
<circle cx="100" cy="100" fill="#9BA3B8" r="2"></circle>
<!-- Crosshairs -->
<line stroke="#1F2433" stroke-width="1" x1="100" x2="100" y1="5" y2="195"></line>
<line stroke="#1F2433" stroke-width="1" x1="5" x2="195" y1="100" y2="100"></line>
<!-- Compass Headings -->
<text fill="#5A6275" font-family="JetBrains Mono" font-size="8" text-anchor="middle" x="100" y="14">N 0°</text>
<text fill="#5A6275" font-family="JetBrains Mono" font-size="8" text-anchor="middle" x="188" y="103">E 90°</text>
<text fill="#5A6275" font-family="JetBrains Mono" font-size="8" text-anchor="middle" x="100" y="193">S 180°</text>
<text fill="#5A6275" font-family="JetBrains Mono" font-size="8" text-anchor="middle" x="12" y="103">W 270°</text>
<!-- Pass Trajectory Arc: Az 142.1° to Az 318.5° reaching Max El 74.8° -->
<!-- AOS point: Southeast ~142 deg, edge (r=95) -> Max El point ~ center (r=16) -> LOS point: Northwest ~318 deg, edge -->
<path d="M 158 174 Q 108 85 36 29" stroke="#3B82F6" stroke-linecap="square" stroke-width="2"></path>
<!-- AOS Marker -->
<circle cx="158" cy="174" fill="#10B981" r="3.5"></circle>
<!-- Max El Marker -->
<circle cx="108" cy="85" fill="#F59E0B" r="4"></circle>
<!-- LOS Marker -->
<circle cx="36" cy="29" fill="#EF4444" r="3.5"></circle>
</svg>
<div class="absolute bottom-1 right-2 font-code-sm text-code-sm text-text-tertiary">MAX EL: 74.8°</div>
</div>
<!-- Ephemeris Vector Metadata Grid -->
<div class="w-full grid grid-cols-3 gap-space-xs mt-space-md pt-space-sm bg-surface-panel p-space-xs text-center">
<div>
<div class="font-label-sm text-label-sm text-text-tertiary">AOS AZIMUTH</div>
<div class="font-code-sm text-code-sm text-status-nominal font-semibold">142.1° (SE)</div>
<div class="font-label-sm text-label-sm text-text-tertiary">06:42:10 UTC</div>
</div>
<div>
<div class="font-label-sm text-label-sm text-text-tertiary">APOGEE EL</div>
<div class="font-code-sm text-code-sm text-status-pending font-semibold">74.8° ZENITH</div>
<div class="font-label-sm text-label-sm text-text-tertiary">06:47:22 UTC</div>
</div>
<div>
<div class="font-label-sm text-label-sm text-text-tertiary">LOS AZIMUTH</div>
<div class="font-code-sm text-code-sm text-error font-semibold">318.5° (NW)</div>
<div class="font-label-sm text-label-sm text-text-tertiary">06:52:45 UTC</div>
</div>
</div>
</div>
</div>
<!-- NOAA GFS / OPEN-METEO CORRIDOR RISK LAYER -->
<div class="bg-surface-panel shadow-sm p-space-md">
<div class="flex items-center justify-between pb-space-sm mb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-primary">cloud</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-semibold">NOAA GFS CLOUD ATTENUATION MATRIX</span>
</div>
<span class="font-code-sm text-code-sm text-text-secondary">T-18H PREDICT</span>
</div>
<div class="flex flex-col gap-space-xs">
<!-- Station 1: Bangalore -->
<div class="bg-surface-inset p-space-sm flex items-center justify-between">
<div>
<div class="font-label-md text-label-md text-text-primary font-semibold">BANGALORE (BLR-01)</div>
<div class="font-code-sm text-code-sm text-text-tertiary">12.97°N, 77.59°E // CIRRUS 12,000m</div>
</div>
<div class="text-right">
<div class="font-code-sm text-code-sm text-status-nominal font-bold">1.2% RISK</div>
<div class="font-label-sm text-label-sm text-text-tertiary">-0.1 dB ATTN</div>
</div>
</div>
<!-- Station 2: Hyderabad -->
<div class="bg-surface-inset p-space-sm flex items-center justify-between">
<div>
<div class="font-label-md text-label-md text-text-primary font-semibold">HYDERABAD (HYD-04)</div>
<div class="font-code-sm text-code-sm text-text-tertiary">17.38°N, 78.48°E // SCATTERED CUMULUS</div>
</div>
<div class="text-right">
<div class="font-code-sm text-code-sm text-status-nominal font-bold">3.4% RISK</div>
<div class="font-label-sm text-label-sm text-text-tertiary">-0.3 dB ATTN</div>
</div>
</div>
<!-- Station 3: Mumbai Coastal -->
<div class="bg-surface-inset p-space-sm flex items-center justify-between">
<div>
<div class="font-label-md text-label-md text-text-primary font-semibold">MUMBAI COASTAL (BOM-02)</div>
<div class="font-code-sm text-code-sm text-text-tertiary">19.07°N, 72.87°E // MARINE STRATUS</div>
</div>
<div class="text-right">
<div class="font-code-sm text-code-sm text-status-pending font-bold">11.8% RISK</div>
<div class="font-label-sm text-label-sm text-text-tertiary">-1.1 dB ATTN</div>
</div>
</div>
</div>
</div>
<!-- ESCROW PRE-FLIGHT CHECK & SMART CONTRACT ESTIMATOR -->
<div class="bg-surface-panel shadow-sm p-space-md">
<div class="flex items-center justify-between pb-space-sm mb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-secondary">verified_user</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-semibold">ESCROW PRE-FLIGHT & DEPOSIT</span>
</div>
<span class="bg-surface-inset text-primary px-space-xs py-0.5 font-code-sm text-code-sm">SOLIDITY v0.8.24</span>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col gap-space-xs font-code-sm text-code-sm">
<div class="flex justify-between items-center text-body-sm">
<span class="text-text-tertiary">REQUIRED DEPOSIT (USDC):</span>
<span class="text-text-primary font-bold font-code-md text-code-md">41.000000 USDC</span>
</div>
<div class="flex justify-between items-center text-body-sm">
<span class="text-text-tertiary">OPERATOR COLLATERAL LOCK:</span>
<span class="text-status-nominal font-bold">49.20 USDC (120%)</span>
</div>
<div class="flex justify-between items-center text-body-sm">
<span class="text-text-tertiary">ESTIMATED GAS (SEPOLIA):</span>
<span class="text-text-secondary">0.0028 ETH (~14.2 GWEI)</span>
</div>
<div class="flex justify-between items-center text-body-sm">
<span class="text-text-tertiary">ORACLE VERIFIER DON:</span>
<span class="text-hash-spectral">SatNOGS / CHAINLINK (5/7)</span>
</div>
<div class="flex justify-between items-center text-body-sm">
<span class="text-text-tertiary">AUTO-RELEASE CONDITION:</span>
<span class="text-text-primary font-semibold">>= 95.0% VALID FRAMES</span>
</div>
</div>
<!-- Escrow Settlement Action Button -->
<div class="mt-space-md flex flex-col gap-space-xs">
<button class="w-full bg-status-active text-on-primary py-space-sm font-label-md text-label-md font-bold uppercase tracking-wider hover:bg-primary-fixed transition-colors flex items-center justify-center gap-space-xs" id="btnExecuteEscrow">
<span class="material-symbols-outlined text-headline-sm">lock</span>
<span>INITIALIZE ESCROW CONTRACT // 41.00 USDC</span>
</button>
<div class="font-code-sm text-code-sm text-text-tertiary text-center">
            NONCE: #08492 // ATTESTATION ROUTER: 0x7f9a...4B12
          </div>
</div>
</div>
</div>
</div>
<!-- INTERACTIVE CLIENT CONTROLLER SCRIPT -->
<script>
    (function() {
      // Table Row Select State
      const rows = document.querySelectorAll('#passLedgerBody tr');
      rows.forEach(row => {
        row.addEventListener('click', function(e) {
          if (e.target.tagName.toLowerCase() === 'button') return;
          rows.forEach(r => r.classList.remove('bg-surface-inset'));
          this.classList.add('bg-surface-inset');
        });
      });

      // Simple Search Query Event
      const queryInput = document.getElementById('orbitalQueryInput');
      const btnRun = document.getElementById('btnRunQuery');
      const btnReset = document.getElementById('btnResetFilters');

      btnRun?.addEventListener('click', function() {
        const val = queryInput.value.toLowerCase();
        rows.forEach(r => {
          const text = r.innerText.toLowerCase();
          if (text.includes('s-band') || text.includes('orbitex') || text.includes('meridian') || text.includes('ka-band')) {
            r.style.display = '';
          }
        });
      });

      btnReset?.addEventListener('click', function() {
        queryInput.value = '';
        rows.forEach(r => r.style.display = '');
      });

      // Escrow Lock Mock Toast Interaction
      const lockButtons = document.querySelectorAll('button');
      lockButtons.forEach(btn => {
        if (btn.innerText.includes('LOCK ESCROW') || btn.innerText.includes('INITIALIZE ESCROW')) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const originalText = this.innerHTML;
            this.innerHTML = \`<span class="material-symbols-outlined text-headline-sm animate-spin">sync</span> BROADCASTING TX...\`;
            setTimeout(() => {
              this.innerHTML = \`<span class="material-symbols-outlined text-headline-sm">check_circle</span> ESCROW COMMITTED\`;
              this.classList.remove('bg-primary', 'bg-status-active');
              this.classList.add('bg-status-nominal-surface', 'text-status-nominal');
            }, 1100);
          });
        }
      });
    })();
  </script>
</div></main>` }} 
    />
  );
}
