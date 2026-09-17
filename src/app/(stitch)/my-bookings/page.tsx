'use client';
export default function Bookings() {
  return (
    <div 
      className="select-none h-full w-full"
      dangerouslySetInnerHTML={{ __html: `<main class="relative w-full flex-1 bg-canvas-base"><div class="flex flex-col w-full">
<!-- Sub-Header Status Ribbon -->
<div class="w-full bg-surface-container-lowest px-space-xl py-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-md">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-widest">MODULE:</span>
<span class="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">BOOKINGS_LEDGER_v2.41</span>
<span class="text-text-tertiary">/</span>
<span class="font-label-sm text-label-sm text-secondary uppercase">EPOCH 941 // SYNCED</span>
</div>
<div class="flex items-center gap-space-lg">
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">LEDGER PROOF:</span>
<span class="font-code-sm text-code-sm text-hash-spectral">0x7c9a...31b2</span>
</div>
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">AUTO-SETTLE:</span>
<span class="font-label-sm text-label-sm text-status-nominal uppercase font-semibold">ENABLED</span>
</div>
</div>
</div>
<!-- Primary Metric Strip -->
<div class="grid grid-cols-5 gap-space-xs p-space-md bg-canvas-base">
<!-- Stat 1 -->
<div class="bg-surface-panel p-space-md flex flex-col justify-between">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">ACTIVE COMMITTED PASSES</span>
<span class="material-symbols-outlined text-headline-sm text-status-active">satellite_alt</span>
</div>
<div class="flex items-baseline gap-space-sm">
<span class="font-label-lg text-headline-lg font-bold text-text-primary tracking-tight">3</span>
<span class="font-code-sm text-code-sm text-status-active uppercase">SLOTS ALLOCATED</span>
</div>
<div class="mt-space-xs w-full bg-surface-inset h-1 overflow-hidden">
<div class="bg-status-active h-full w-[60%]"></div>
</div>
</div>
<!-- Stat 2 -->
<div class="bg-surface-panel p-space-md flex flex-col justify-between">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">TOTAL CAPITAL IN ESCROW</span>
<span class="material-symbols-outlined text-headline-sm text-status-pending">lock_clock</span>
</div>
<div class="flex items-baseline gap-space-sm">
<span class="font-label-lg text-headline-lg font-bold text-text-primary tracking-tight">\$18,420.00</span>
<span class="font-code-sm text-code-sm text-text-secondary">USDC</span>
</div>
<div class="mt-space-xs flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>SEPOLIA CONTRACT</span>
<span class="text-status-nominal">VERIFIED 100%</span>
</div>
</div>
<!-- Stat 3 -->
<div class="bg-surface-panel p-space-md flex flex-col justify-between">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">COMPLETED PASSES</span>
<span class="material-symbols-outlined text-headline-sm text-status-nominal">task_alt</span>
</div>
<div class="flex items-baseline gap-space-sm">
<span class="font-label-lg text-headline-lg font-bold text-text-primary tracking-tight">48</span>
<span class="font-code-sm text-code-sm text-text-secondary">ALL-TIME SLOTS</span>
</div>
<div class="mt-space-xs flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>SETTLEMENT TOTAL</span>
<span class="text-text-secondary">\$142,880.00</span>
</div>
</div>
<!-- Stat 4 -->
<div class="bg-surface-panel p-space-md flex flex-col justify-between">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">SLA RELIABILITY SCORE</span>
<span class="material-symbols-outlined text-headline-sm text-status-nominal">verified</span>
</div>
<div class="flex items-baseline gap-space-sm">
<span class="font-label-lg text-headline-lg font-bold text-status-nominal tracking-tight">99.82%</span>
<span class="font-code-sm text-code-sm text-status-nominal font-semibold">Q4 RANK A+</span>
</div>
<div class="mt-space-xs w-full bg-surface-inset h-1 overflow-hidden">
<div class="bg-status-nominal h-full w-[99.82%]"></div>
</div>
</div>
<!-- Stat 5 -->
<div class="bg-surface-panel p-space-md flex flex-col justify-between">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">UNCLAIMED ESCROW REFUNDS</span>
<span class="material-symbols-outlined text-headline-sm text-text-tertiary">savings</span>
</div>
<div class="flex items-baseline gap-space-sm">
<span class="font-label-lg text-headline-lg font-bold text-text-primary tracking-tight">\$0.00</span>
<span class="font-code-sm text-code-sm text-text-tertiary">NO SURPLUS</span>
</div>
<div class="mt-space-xs flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>TREASURY SWEEP</span>
<span class="text-text-secondary">AUTO-REBALANCED</span>
</div>
</div>
</div>
<!-- Main Multi-Pane Cockpit -->
<div class="grid grid-cols-12 gap-space-xs p-space-md pt-0 bg-canvas-base">
<!-- Ledger & Bookings Primary Column (8 Cols) -->
<div class="col-span-8 flex flex-col gap-space-xs">
<!-- Filter Bar & Control Tabs -->
<div class="bg-surface-panel flex items-center justify-between px-space-md py-space-xs">
<div class="flex items-center gap-space-xs font-label-sm text-label-sm">
<button class="bg-surface-inset text-primary px-space-md py-1 font-semibold uppercase flex items-center gap-space-xs">
<span>ALL BOOKINGS</span>
<span class="bg-surface-container-high px-1 text-primary-fixed">51</span>
</button>
<button class="bg-surface-panel hover:bg-surface-inset text-text-secondary hover:text-text-primary px-space-md py-1 uppercase flex items-center gap-space-xs">
<span>ACTIVE / IN ESCROW</span>
<span class="bg-status-active-surface text-status-active px-1 font-bold">3</span>
</button>
<button class="bg-surface-panel hover:bg-surface-inset text-text-secondary hover:text-text-primary px-space-md py-1 uppercase flex items-center gap-space-xs">
<span>PENDING QUORUM</span>
<span class="bg-status-pending-surface text-status-pending px-1">1</span>
</button>
<button class="bg-surface-panel hover:bg-surface-inset text-text-secondary hover:text-text-primary px-space-md py-1 uppercase flex items-center gap-space-xs">
<span>SETTLED / ARCHIVED</span>
<span class="bg-surface-container-low text-text-tertiary px-1">47</span>
</button>
</div>
<div class="flex items-center gap-space-sm font-label-sm text-label-sm">
<div class="flex items-center gap-space-xs bg-surface-inset px-space-sm py-1">
<span class="material-symbols-outlined text-body-sm text-text-tertiary">search</span>
<input class="bg-transparent text-text-primary font-code-sm text-code-sm outline-none placeholder:text-text-tertiary w-44" placeholder="FILTER PASS ID / SAT / HASH..." type="text"/>
</div>
<button class="bg-surface-inset hover:bg-surface-container-high text-text-secondary hover:text-text-primary px-space-sm py-1 flex items-center gap-space-xs">
<span class="material-symbols-outlined text-body-sm">tune</span>
<span>CRITERIA</span>
</button>
</div>
</div>
<!-- Bookings Ledger Container -->
<div class="bg-surface-panel flex flex-col">
<!-- Table Column Headers -->
<div class="grid grid-cols-12 bg-surface-inset px-space-md py-space-xs font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider items-center">
<div class="col-span-2">PASS IDENTIFIER</div>
<div class="col-span-2">TARGET / ORBIT</div>
<div class="col-span-2">BAND & THROUGHPUT</div>
<div class="col-span-2">TIME WINDOW (UTC)</div>
<div class="col-span-1 text-right">ESCROW</div>
<div class="col-span-3 text-right">CLEARING LIFECYCLE & STATE</div>
</div>
<!-- Row 1: #OA-1042 (Selected / In Focus) -->
<div class="grid grid-cols-12 px-space-md py-space-sm bg-surface-panel hover:bg-surface-inset items-center cursor-pointer transition-none bg-surface-container-lowest">
<div class="col-span-2 flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-code-sm text-code-sm font-bold text-primary">#OA-1042</span>
<span class="h-1.5 w-1.5 bg-status-active"></span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">TX: 0x9e1...55da</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-body-sm text-body-sm font-semibold text-text-primary">SAT-07 (ORBITEX)</span>
<span class="font-code-sm text-label-sm text-text-secondary">LEO 550km · INC 97.4°</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-primary">S-Band 50 Mbps</span>
<span class="font-label-sm text-label-sm text-text-tertiary">RHCP · 2245.50 MHz</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-primary">18:41:00 - 18:52:14</span>
<span class="font-label-sm text-label-sm text-status-pending">ACTIVE PASS DURATION (11m 14s)</span>
</div>
<div class="col-span-1 text-right flex flex-col items-end">
<span class="font-code-sm text-body-sm font-semibold text-text-primary">\$12,500.00</span>
<span class="font-label-sm text-label-sm text-text-tertiary">USDC</span>
</div>
<div class="col-span-3 flex flex-col items-end gap-space-xs">
<div class="bg-status-pending-surface px-space-xs py-0.5 flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-pending animate-ping"></span>
<span class="font-label-sm text-label-sm text-status-pending font-bold tracking-wider">FUNDS LOCKED // TELEMETRY QUORUM RATIFICATION</span>
</div>
<div class="flex items-center gap-space-xs">
<button class="bg-status-active text-canvas-base px-space-sm py-0.5 font-label-sm text-label-sm font-bold uppercase hover:bg-primary">INSPECT CLEARING</button>
<button class="bg-status-breach-surface text-status-breach hover:bg-status-breach hover:text-canvas-base px-space-sm py-0.5 font-label-sm text-label-sm font-semibold uppercase">DISPUTE</button>
</div>
</div>
</div>
<!-- Row 2: #OA-1039 (Settled) -->
<div class="grid grid-cols-12 px-space-md py-space-sm bg-surface-panel hover:bg-surface-inset items-center cursor-pointer transition-none">
<div class="col-span-2 flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-code-sm text-code-sm font-bold text-text-secondary">#OA-1039</span>
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">TX: 0x82f...41a</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-body-sm text-body-sm font-semibold text-text-primary">METEOSAT-X (MERIDIAN)</span>
<span class="font-code-sm text-label-sm text-text-secondary">LEO 480km · INC 53.0°</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-primary">X-Band 150 Mbps</span>
<span class="font-label-sm text-label-sm text-text-tertiary">LHCP · 8410.00 MHz</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-secondary">14:10:00 - 14:21:30</span>
<span class="font-label-sm text-label-sm text-text-tertiary">ELAPSED 4H 20M AGO</span>
</div>
<div class="col-span-1 text-right flex flex-col items-end">
<span class="font-code-sm text-body-sm font-semibold text-text-primary">\$4,200.00</span>
<span class="font-label-sm text-label-sm text-text-tertiary">USDC</span>
</div>
<div class="col-span-3 flex flex-col items-end gap-space-xs">
<div class="bg-status-nominal-surface px-space-xs py-0.5 flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span class="font-label-sm text-label-sm text-status-nominal font-bold tracking-wider">COMPLETED // PAYMENT RELEASED</span>
</div>
<div class="flex items-center gap-space-xs">
<button class="bg-surface-inset text-text-secondary hover:text-text-primary px-space-sm py-0.5 font-label-sm text-label-sm uppercase flex items-center gap-space-xs">
<span class="material-symbols-outlined text-label-sm">download</span>
<span>IPFS CAR</span>
</button>
<button class="bg-surface-inset text-text-secondary hover:text-text-primary px-space-sm py-0.5 font-label-sm text-label-sm uppercase flex items-center gap-space-xs">
<span class="material-symbols-outlined text-label-sm">policy</span>
<span>AUDIT TRAIL</span>
</button>
</div>
</div>
</div>
<!-- Row 3: #OA-1035 (Slashed / Dispute Resolved) -->
<div class="grid grid-cols-12 px-space-md py-space-sm bg-surface-panel hover:bg-surface-inset items-center cursor-pointer transition-none">
<div class="col-span-2 flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-code-sm text-code-sm font-bold text-text-secondary">#OA-1035</span>
<span class="h-1.5 w-1.5 bg-status-breach"></span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">TX: 0x31a...00cf</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-body-sm text-body-sm font-semibold text-text-primary">POLARIS-RAD-01</span>
<span class="font-code-sm text-label-sm text-text-secondary">SSO 620km · INC 98.2°</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-primary">Ka-Band 200 Mbps</span>
<span class="font-label-sm text-label-sm text-text-tertiary">LHCP · 26.50 GHz</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-secondary">11:00:00 - 11:15:00</span>
<span class="font-label-sm text-label-sm text-text-tertiary">ELAPSED 7H 31M AGO</span>
</div>
<div class="col-span-1 text-right flex flex-col items-end">
<span class="font-code-sm text-body-sm font-semibold text-text-secondary line-through">\$1,720.00</span>
<span class="font-label-sm text-label-sm text-status-nominal">REFUNDED</span>
</div>
<div class="col-span-3 flex flex-col items-end gap-space-xs">
<div class="bg-status-breach-surface px-space-xs py-0.5 flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-breach"></span>
<span class="font-label-sm text-label-sm text-status-breach font-bold tracking-wider">DISPUTE RESOLVED // 100% REFUNDED (RF Drop)</span>
</div>
<div class="flex items-center gap-space-xs">
<button class="bg-status-breach-surface text-status-breach hover:bg-status-breach hover:text-canvas-base px-space-sm py-0.5 font-label-sm text-label-sm uppercase flex items-center gap-space-xs">
<span class="material-symbols-outlined text-label-sm">warning</span>
<span>VIEW SLASHER EVENT</span>
</button>
</div>
</div>
</div>
<!-- Row 4: Historical Context Filler -->
<div class="grid grid-cols-12 px-space-md py-space-sm bg-surface-panel hover:bg-surface-inset items-center opacity-60">
<div class="col-span-2 flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-code-sm text-code-sm text-text-secondary">#OA-1028</span>
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">TX: 0x11b...a94c</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-body-sm text-body-sm text-text-primary">SENTINEL-RF4</span>
<span class="font-code-sm text-label-sm text-text-secondary">LEO 690km · POLAR</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-primary">X-Band 100 Mbps</span>
<span class="font-label-sm text-label-sm text-text-tertiary">RHCP · 8200.00 MHz</span>
</div>
<div class="col-span-2 flex flex-col">
<span class="font-code-sm text-body-sm text-text-secondary">06:22:10 - 06:31:05</span>
<span class="font-label-sm text-label-sm text-text-tertiary">YESTERDAY</span>
</div>
<div class="col-span-1 text-right flex flex-col items-end">
<span class="font-code-sm text-body-sm text-text-secondary">\$3,850.00</span>
<span class="font-label-sm text-label-sm text-text-tertiary">USDC</span>
</div>
<div class="col-span-3 flex flex-col items-end gap-space-xs">
<div class="bg-surface-inset px-space-xs py-0.5">
<span class="font-label-sm text-label-sm text-text-secondary font-mono tracking-wider">SETTLED // VERIFIED BY 7/7 NODES</span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">PAYMENT RELEASED IN BLOCK #6,889,102</span>
</div>
</div>
</div>
<!-- Orbital Asset Visual Graphic & Observation Ground Stations -->
<div class="bg-surface-panel p-space-md flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs font-label-md text-label-md uppercase text-text-primary font-bold">
<span class="material-symbols-outlined text-headline-sm text-primary">public</span>
<span>GROUND TRACK & DOWNLINK FOOTPRINT CONE // PASS #OA-1042</span>
</div>
<span class="font-code-sm text-code-sm text-text-tertiary">SGP4 PROPAGATOR V4.1.2</span>
</div>
<div class="grid grid-cols-3 gap-space-sm">
<!-- Orbital Pass Overhead Visualization -->
<div class="col-span-2 bg-canvas-base p-space-sm relative overflow-hidden flex flex-col justify-between h-44">
<!-- Simulated Coordinate Grid Vector Map -->
<svg class="absolute inset-0 w-full h-full opacity-20 text-text-tertiary" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern height="20" id="grid" patternunits="userSpaceOnUse" width="20">
<path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5"></path>
</pattern>
</defs>
<rect fill="url(#grid)" height="100%" width="100%"></rect>
<line stroke="currentColor" stroke-dasharray="4,4" stroke-width="1" x1="0" x2="100%" y1="50%" y2="50%"></line>
<line stroke="currentColor" stroke-dasharray="4,4" stroke-width="1" x1="50%" x2="50%" y1="0" y2="100%"></line>
</svg>
<!-- Orbital Path Spline -->
<svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
<path d="M 10 140 Q 180 20, 480 90" fill="none" stroke="#3B82F6" stroke-width="2"></path>
<!-- Sat Position -->
<circle cx="280" cy="55" fill="#adc6ff" r="4"></circle>
<circle class="animate-ping" cx="280" cy="55" fill="none" r="14" stroke="#adc6ff" stroke-opacity="0.4" stroke-width="1"></circle>
<!-- Footprint Radii -->
<ellipse cx="280" cy="80" fill="none" opacity="0.6" rx="90" ry="35" stroke="#3B82F6" stroke-dasharray="2,2" stroke-width="1"></ellipse>
<!-- GS Marker 1 -->
<rect fill="#10B981" height="4" width="4" x="240" y="70"></rect>
<!-- GS Marker 2 -->
<rect fill="#10B981" height="4" width="4" x="295" y="85"></rect>
<!-- GS Marker 3 -->
<rect fill="#10B981" height="4" width="4" x="210" y="65"></rect>
<!-- GS Marker 4 -->
<rect fill="#10B981" height="4" width="4" x="330" y="75"></rect>
</svg>
<div class="relative z-10 flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>SUBCIRCULAR LEO TRACE // LAT: +37.7749° | LON: -122.4194°</span>
<span class="text-status-active font-code-sm">IN-VIEW: T-02M 18S REMAINING</span>
</div>
<div class="relative z-10 flex items-center justify-between font-code-sm text-code-sm bg-surface-inset/80 p-space-xs">
<span class="text-text-secondary">ELEVATION: <strong class="text-text-primary">64.2° MAX</strong></span>
<span class="text-text-secondary">AZIMUTH: <strong class="text-text-primary">178.4° SSE</strong></span>
<span class="text-text-secondary">RANGE: <strong class="text-text-primary">742.8 km</strong></span>
<span class="text-text-secondary">SLANT LOSS: <strong class="text-text-primary">-168.4 dB</strong></span>
</div>
</div>
<!-- Ground Station Swarm Health Status -->
<div class="col-span-1 bg-surface-inset p-space-sm flex flex-col justify-between">
<div>
<div class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider mb-space-xs">DON QUORUM GROUND RECEIVERS</div>
<div class="space-y-1">
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-secondary">SatNOGS #1488 (SF)</span>
<span class="text-status-nominal font-code-sm">LOCK 98.4%</span>
</div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-secondary">SatNOGS #2104 (BLDR)</span>
<span class="text-status-nominal font-code-sm">LOCK 99.1%</span>
</div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-secondary">SatNOGS #0992 (SVAL)</span>
<span class="text-status-nominal font-code-sm">LOCK 94.7%</span>
</div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-secondary">NOAA-GS #4 (GOLD)</span>
<span class="text-status-nominal font-code-sm">LOCK 99.9%</span>
</div>
</div>
</div>
<div class="p-space-xs bg-surface-panel mt-space-xs">
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-tertiary">STATION SYNC:</span>
<span class="text-status-nominal font-bold">4/4 LOCKED (100%)</span>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Deep Inspection Drawer / Active Pass Monitor (4 Cols) -->
<div class="col-span-4 flex flex-col gap-space-xs">
<!-- Panel Header -->
<div class="bg-surface-panel p-space-md flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-status-pending">policy</span>
<span class="font-headline-sm text-headline-sm text-text-primary font-bold">CLEARING INSPECTOR</span>
</div>
<span class="bg-surface-inset text-primary px-space-xs py-0.5 font-label-sm text-label-sm">SLOT #OA-1042</span>
</div>
<p class="font-body-sm text-body-sm text-text-secondary">
          Decentralized verification engine validating raw radio frequency telemetry ingest against smart escrow release conditions.
        </p>
</div>
<!-- Pass Phase Timeline (Vertical Chrono Tracker) -->
<div class="bg-surface-panel p-space-md flex flex-col gap-space-md">
<div class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">SETTLEMENT EXECUTION TIMELINE</div>
<div class="space-y-space-md relative pl-4 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-border-default">
<!-- Phase 1 -->
<div class="relative flex flex-col">
<div class="absolute -left-[19px] top-1 h-2.5 w-2.5 bg-status-nominal"></div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-primary font-bold">1. SGP4 WINDOW BOOKED</span>
<span class="text-status-nominal font-code-sm">CONFIRMED</span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">Orbital epoch validated via NORAD TLE #54921</span>
</div>
<!-- Phase 2 -->
<div class="relative flex flex-col">
<div class="absolute -left-[19px] top-1 h-2.5 w-2.5 bg-status-nominal"></div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-primary font-bold">2. ESCROW LOCKED ON SEPOLIA</span>
<span class="text-status-nominal font-code-sm">12,500 USDC</span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">TxHash: 0x9e10...55da | Gas: 21,490</span>
</div>
<!-- Phase 3 -->
<div class="relative flex flex-col">
<div class="absolute -left-[19px] top-1 h-2.5 w-2.5 bg-status-active animate-pulse"></div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-primary font-bold">3. SATNOGS DOPPLER CAPTURE</span>
<span class="text-status-active font-code-sm">INGESTING</span>
</div>
<span class="font-code-sm text-label-sm text-text-secondary">41.8 MB parsed // SNR: 24.2 dB nominal</span>
</div>
<!-- Phase 4 -->
<div class="relative flex flex-col opacity-80">
<div class="absolute -left-[19px] top-1 h-2.5 w-2.5 bg-status-pending"></div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-secondary font-bold">4. DON CONSENSUS QUORUM</span>
<span class="text-status-pending font-code-sm">4/7 SIGNED</span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">Aggregating decentralized oracle attestation</span>
</div>
<!-- Phase 5 -->
<div class="relative flex flex-col opacity-40">
<div class="absolute -left-[19px] top-1 h-2.5 w-2.5 bg-text-tertiary"></div>
<div class="flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-tertiary font-bold">5. FINAL SETTLEMENT DISBURSEMENT</span>
<span class="text-text-tertiary font-code-sm">STANDBY</span>
</div>
<span class="font-code-sm text-label-sm text-text-tertiary">Payload CID pin & escrow balance transfer</span>
</div>
</div>
</div>
<!-- Live RF Signal & Telemetry Link Diagnostics -->
<div class="bg-surface-panel p-space-md flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">CARRIER LINK TELEMETRY (LIVE)</span>
<span class="font-label-sm text-label-sm text-status-nominal flex items-center gap-1">
<span class="h-1.5 w-1.5 bg-status-nominal animate-ping"></span>
            CARRIER LOCKED
          </span>
</div>
<!-- RF Diagnostic Grid -->
<div class="grid grid-cols-2 gap-space-xs font-code-sm text-code-sm">
<div class="bg-surface-inset p-space-xs flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary">CENTER FREQ</span>
<span class="text-text-primary font-bold">2245.500 MHz</span>
</div>
<div class="bg-surface-inset p-space-xs flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary">DOPPLER OFFSET</span>
<span class="text-status-nominal font-bold">-1.42 kHz</span>
</div>
<div class="bg-surface-inset p-space-xs flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary">MEASURED SNR</span>
<span class="text-text-primary font-bold">24.2 dB</span>
</div>
<div class="bg-surface-inset p-space-xs flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary">FRAME LOSS</span>
<span class="text-status-nominal font-bold">0.00% (0 pkts)</span>
</div>
</div>
<!-- Mini RF Spectrum Waterfall Representation -->
<div class="bg-canvas-base p-space-xs flex flex-col gap-1 overflow-hidden">
<div class="flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>2244.5 MHz</span>
<span class="text-primary font-bold">RF WATERFALL SPECTRUM</span>
<span>2246.5 MHz</span>
</div>
<div class="h-12 w-full bg-surface-inset flex items-end gap-0.5 px-1 py-1">
<div class="w-1/12 bg-text-tertiary h-[20%]"></div>
<div class="w-1/12 bg-text-tertiary h-[25%]"></div>
<div class="w-1/12 bg-text-tertiary h-[15%]"></div>
<div class="w-1/12 bg-status-active h-[45%]"></div>
<div class="w-1/12 bg-primary h-[85%]"></div>
<div class="w-1/12 bg-secondary h-[95%]"></div>
<div class="w-1/12 bg-primary h-[80%]"></div>
<div class="w-1/12 bg-status-active h-[50%]"></div>
<div class="w-1/12 bg-text-tertiary h-[30%]"></div>
<div class="w-1/12 bg-text-tertiary h-[20%]"></div>
<div class="w-1/12 bg-text-tertiary h-[15%]"></div>
<div class="w-1/12 bg-text-tertiary h-[20%]"></div>
</div>
</div>
</div>
<!-- Raw Data Extraction Deck -->
<div class="bg-surface-panel p-space-md flex flex-col gap-space-sm">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">DECRYPTED TELEMETRY & CLEARING DISPATCH</span>
<div class="flex flex-col gap-space-xs font-label-sm text-label-sm">
<button class="w-full bg-surface-inset hover:bg-surface-container-high text-text-primary px-space-md py-space-sm flex items-center justify-between transition-none">
<span class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-primary">download</span>
<span>DOWNLOAD TELEMETRY PAYLOAD (.bin / .pcap)</span>
</span>
<span class="font-code-sm text-text-tertiary">41.8 MB</span>
</button>
<button class="w-full bg-surface-inset hover:bg-surface-container-high text-text-primary px-space-md py-space-sm flex items-center justify-between transition-none">
<span class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-hash-spectral">verified_user</span>
<span>VERIFY MERKLE PROOF & DON ATTESTATION</span>
</span>
<span class="font-code-sm text-hash-spectral">0x91F8</span>
</button>
<button class="w-full bg-surface-inset hover:bg-surface-container-high text-text-primary px-space-md py-space-sm flex items-center justify-between transition-none">
<span class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm text-text-secondary">receipt_long</span>
<span>EXPORT TAX & SETTLEMENT RECEIPT (PDF)</span>
</span>
<span class="font-code-sm text-text-tertiary">IRS / ITU</span>
</button>
</div>
<div class="mt-space-xs p-space-xs bg-surface-inset flex items-center justify-between font-label-sm text-label-sm">
<span class="text-text-tertiary">CONTRACT ADDRESS:</span>
<span class="font-code-sm text-code-sm text-primary">0x7f9a88319200a4B12</span>
</div>
</div>
</div>
</div>
</div></main>` }} 
    />
  );
}
