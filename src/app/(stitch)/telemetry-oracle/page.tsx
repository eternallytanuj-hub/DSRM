'use client';
export default function Telemetry() {
  return (
    <div 
      className="select-none h-full w-full"
      dangerouslySetInnerHTML={{ __html: `<main class="relative w-full flex-1 bg-canvas-base"><div class="flex flex-col w-full">
<!-- Telemetry Bar -->
<div class="w-full bg-surface-panel p-space-md flex flex-wrap items-center justify-between gap-space-md">
<div class="flex items-center gap-space-xl flex-wrap">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Connected Ground Stations</span>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="h-2 w-2 bg-status-nominal animate-pulse"></span>
<span class="font-headline-md text-headline-md text-text-primary">418</span>
<span class="font-label-sm text-label-sm text-secondary uppercase">GLOBAL</span>
</div>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Active Ingest Streams</span>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="font-headline-md text-headline-md text-primary">32</span>
<span class="font-label-sm text-label-sm text-text-secondary">SYNCHRONIZED</span>
</div>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">NOAA Atmospheric Ingest</span>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="font-code-md text-code-md text-text-primary">GFS 0.25°</span>
<span class="font-label-sm text-label-sm px-1 bg-surface-inset text-status-nominal">NOMINAL</span>
</div>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Packet Merkle Root</span>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="font-code-sm text-code-sm text-hash-spectral">0x91f89c44b821a...33ea</span>
<button class="text-text-tertiary hover:text-text-primary transition-colors" onclick="navigator.clipboard.writeText('0x91f89c44b821a39f6004b721832048f09231889c33ea')" title="Copy Merkle Hash">
<span class="material-symbols-outlined text-headline-sm">content_copy</span>
</button>
</div>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Oracle Latency</span>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="font-headline-md text-headline-md text-status-nominal">240<span class="text-body-sm font-label-sm">ms</span></span>
<span class="font-label-sm text-label-sm text-text-secondary">P99 DON</span>
</div>
</div>
</div>
<div class="flex items-center gap-space-sm">
<div class="flex items-center gap-space-xs bg-surface-inset px-space-md py-1">
<span class="font-label-sm text-label-sm text-text-tertiary">INGEST PIPELINE:</span>
<span class="font-code-sm text-code-sm text-status-nominal font-bold">ARMED & VERIFIED</span>
</div>
<button class="bg-primary text-on-primary font-label-md text-label-md px-space-lg h-7 font-bold hover:bg-white transition-none uppercase">
        Flush Buffer
      </button>
</div>
</div>
<!-- Primary Cockpit Deck -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-sm p-space-sm w-full">
<!-- LEFT / CENTER COLUMN: Panels 1 & 2 -->
<div class="xl:col-span-8 flex flex-col gap-space-sm min-w-0">
<!-- Panel 1: Live SatNOGS Network Ingest & Demodulation Stream -->
<div class="bg-surface-panel flex flex-col">
<div class="h-8 bg-surface-inset px-space-md flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-headline-sm text-status-active">sensors</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-bold">SatNOGS Demodulation Stream // Sub-Hz Telemetry Frame Feed</span>
</div>
<div class="flex items-center gap-space-md">
<span class="font-label-sm text-label-sm text-text-tertiary">PROTOCOL: <span class="text-primary font-code-sm">AX.25 / CCSDS 131.0-B</span></span>
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
</div>
</div>
<!-- Frame Table Headers -->
<div class="grid grid-cols-12 bg-surface-container-lowest px-space-md py-1 font-label-sm text-label-sm text-text-tertiary uppercase">
<div class="col-span-2">UTC Timestamp</div>
<div class="col-span-2">Node / Location</div>
<div class="col-span-2">Antenna Array</div>
<div class="col-span-1 text-right">SNR (dB)</div>
<div class="col-span-2 text-right">Doppler Dev</div>
<div class="col-span-2 text-center">FEC Check</div>
<div class="col-span-1 text-right">Bytes</div>
</div>
<!-- Live Ingest Logs -->
<div class="flex flex-col font-code-sm text-code-sm divide-y-0" id="telemetryFeed">
<div class="grid grid-cols-12 items-center px-space-md py-1.5 hover:bg-surface-inset bg-canvas-base transition-none">
<div class="col-span-2 text-text-secondary">18:42:19.102</div>
<div class="col-span-2 text-text-primary truncate">Node #189 <span class="text-text-tertiary">Bangalore</span></div>
<div class="col-span-2 text-text-secondary truncate">3.0m S-Band Dish</div>
<div class="col-span-1 text-right text-status-nominal font-bold">+18.4</div>
<div class="col-span-2 text-right text-text-primary font-code-sm">+0.12 kHz</div>
<div class="col-span-2 flex justify-center">
<span class="px-1.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">RS(255,223) OK</span>
</div>
<div class="col-span-1 text-right text-hash-spectral">1,024</div>
</div>
<div class="grid grid-cols-12 items-center px-space-md py-1.5 hover:bg-surface-inset bg-surface-panel transition-none">
<div class="col-span-2 text-text-secondary">18:42:18.844</div>
<div class="col-span-2 text-text-primary truncate">Node #244 <span class="text-text-tertiary">Hyderabad</span></div>
<div class="col-span-2 text-text-secondary truncate">VHF/UHF Yagi 2x14</div>
<div class="col-span-1 text-right text-status-nominal font-bold">+14.2</div>
<div class="col-span-2 text-right text-text-primary font-code-sm">-0.08 kHz</div>
<div class="col-span-2 flex justify-center">
<span class="px-1.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">LDPC 7/8 PASS</span>
</div>
<div class="col-span-1 text-right text-hash-spectral">512</div>
</div>
<div class="grid grid-cols-12 items-center px-space-md py-1.5 hover:bg-surface-inset bg-canvas-base transition-none">
<div class="col-span-2 text-text-secondary">18:42:17.391</div>
<div class="col-span-2 text-text-primary truncate">Node #312 <span class="text-text-tertiary">Colombo</span></div>
<div class="col-span-2 text-text-secondary truncate">2.4m Parabolic</div>
<div class="col-span-1 text-right text-status-pending font-bold">+9.8</div>
<div class="col-span-2 text-right text-status-pending font-code-sm">+0.44 kHz</div>
<div class="col-span-2 flex justify-center">
<span class="px-1.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">RS(255,223) OK</span>
</div>
<div class="col-span-1 text-right text-hash-spectral">1,024</div>
</div>
<div class="grid grid-cols-12 items-center px-space-md py-1.5 hover:bg-surface-inset bg-surface-panel transition-none">
<div class="col-span-2 text-text-secondary">18:42:16.920</div>
<div class="col-span-2 text-text-primary truncate">Node #402 <span class="text-text-tertiary">Muscat</span></div>
<div class="col-span-2 text-text-secondary truncate">Quad Helix Array</div>
<div class="col-span-1 text-right text-status-nominal font-bold">+16.1</div>
<div class="col-span-2 text-right text-text-primary font-code-sm">-0.02 kHz</div>
<div class="col-span-2 flex justify-center">
<span class="px-1.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">LDPC 7/8 PASS</span>
</div>
<div class="col-span-1 text-right text-hash-spectral">2,048</div>
</div>
</div>
<!-- Raw Decoded Hex Packet Dump Sub-deck -->
<div class="bg-canvas-base p-space-sm font-code-sm text-code-sm overflow-x-auto">
<div class="flex items-center justify-between pb-1 text-text-tertiary font-label-sm text-label-sm">
<span>RAW CCSDS SYNC HEX BUFFER (FRAME ID #0x8C1109)</span>
<span class="text-secondary">ECC SYNDROME: 0 ERRORS</span>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-space-xs text-text-secondary leading-tight">
<div>
<span class="text-text-tertiary">0000:</span> 1A CF FC 1D 00 24 5F 88 0A 1B 94 EF CC 41 82 04 <span class="text-primary">..\$_.•...A..</span><br/>
<span class="text-text-tertiary">0010:</span> 4E 4F 52 41 44 23 35 38 32 31 34 20 44 53 52 4D <span class="text-secondary">NORAD#58214 DSRM</span><br/>
<span class="text-text-tertiary">0020:</span> 7B 22 74 78 22 3A 22 32 32 34 35 2E 35 22 2C 22 <span class="text-text-primary">{"tx":"2245.5","</span>
</div>
<div>
<span class="text-text-tertiary">0030:</span> 65 73 63 72 6F 77 22 3A 22 30 78 37 66 39 61 22 <span class="text-text-primary">escrow":"0x7f9a"</span><br/>
<span class="text-text-tertiary">0040:</span> 2C 22 73 69 67 22 3A 22 33 66 38 63 64 61 31 22 <span class="text-text-primary">,"sig":"3f8cda1"</span><br/>
<span class="text-text-tertiary">0050:</span> 7D 00 00 00 9A BC FF FE 42 10 98 AA ED 12 09 FA <span class="text-hash-spectral">}.......B.......</span>
</div>
</div>
</div>
</div>
<!-- Panel 2: Live Doppler Frequency Curve & Carrier Waterfall -->
<div class="bg-surface-panel flex flex-col">
<div class="h-8 bg-surface-inset px-space-md flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-headline-sm text-hash-spectral">timeline</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-bold">Doppler Frequency S-Curve & Waterfall Matrix</span>
</div>
<div class="flex items-center gap-space-md font-label-sm text-label-sm">
<span class="text-text-tertiary">TARGET: <span class="text-text-primary font-code-sm">NORAD #58214 (LEMUR-2)</span></span>
<span class="text-text-tertiary">FC: <span class="text-text-primary font-code-sm">2245.500 MHz</span></span>
<span class="text-text-tertiary">TCA IN: <span class="text-status-nominal font-code-sm">00:03:14</span></span>
</div>
</div>
<div class="p-space-md flex flex-col gap-space-md">
<!-- Live S-Curve Canvas SVG -->
<div class="relative w-full h-44 bg-canvas-base flex flex-col justify-between p-2 overflow-hidden">
<!-- Grid Lines -->
<div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
<div class="w-full h-px bg-outline"></div>
<div class="w-full h-px bg-outline"></div>
<div class="w-full h-px bg-outline"></div>
<div class="w-full h-px bg-outline"></div>
<div class="w-full h-px bg-outline"></div>
</div>
<div class="absolute inset-0 flex justify-between pointer-events-none opacity-20">
<div class="h-full w-px bg-outline"></div>
<div class="h-full w-px bg-outline"></div>
<div class="h-full w-px bg-outline"></div>
<div class="h-full w-px bg-outline"></div>
<div class="h-full w-px bg-outline"></div>
</div>
<!-- Doppler Inflection Curve Graphic -->
<svg class="w-full h-full relative z-10" preserveaspectratio="none" viewbox="0 0 800 150">
<!-- Upper & Lower Confidence Margins -->
<path d="M 0,25 C 250,25 350,50 400,75 C 450,100 550,125 800,125 L 800,135 C 550,135 450,110 400,85 C 350,60 250,35 0,35 Z" fill="rgba(59, 130, 246, 0.08)"></path>
<!-- Theoretical Path -->
<path d="M 0,30 C 250,30 350,60 400,80 C 450,100 550,130 800,130" fill="none" stroke="#5A6275" stroke-dasharray="4,4" stroke-width="1.5"></path>
<!-- Observed Doppler Track (SatNOGS Oracle multi-node telemetry) -->
<path d="M 0,28 C 120,29 220,32 300,48 C 360,62 390,76 400,80 C 410,84 440,98 500,112 C 580,126 680,129 800,131" fill="none" stroke="#3B82F6" stroke-width="2"></path>
<!-- Current TCA Observation Pointer -->
<circle cx="400" cy="80" fill="#10B981" r="4"></circle>
<line stroke="#10B981" stroke-dasharray="2,2" stroke-width="1" x1="400" x2="400" y1="0" y2="150"></line>
<text class="font-code-sm" fill="#10B981" font-size="10" x="408" y="78">TCA (0.0 kHz Shift)</text>
<!-- Point markers -->
<circle cx="200" cy="31" fill="#ADC6FF" r="2.5"></circle>
<text class="font-label-sm" fill="#9BA3B8" font-size="9" x="206" y="28">Node #189 (+48.2 kHz)</text>
<circle cx="600" cy="128" fill="#ADC6FF" r="2.5"></circle>
<text class="font-label-sm" fill="#9BA3B8" font-size="9" x="606" y="125">Node #402 (-47.9 kHz)</text>
</svg>
<!-- Bottom axis legend -->
<div class="relative z-20 flex justify-between font-label-sm text-label-sm text-text-tertiary">
<span>AOS (18:38:00 UTC)</span>
<span class="text-text-secondary">f_offset: +52.3 kHz</span>
<span class="text-status-nominal font-bold">MAX ELEV: 68.4°</span>
<span class="text-text-secondary">f_offset: -51.8 kHz</span>
<span>LOS (18:47:30 UTC)</span>
</div>
</div>
<!-- ASCII Waterfall & RF Energy Distribution -->
<div class="bg-surface-inset p-space-sm flex flex-col gap-space-xs font-code-sm text-code-sm">
<div class="flex items-center justify-between text-text-tertiary font-label-sm text-label-sm">
<span>SPECTRAL DENSITY WATERFALL // FFT BIN: 1024 // RES: 12.5 Hz</span>
<span class="text-primary">BW: 250 kHz</span>
</div>
<div class="grid grid-cols-12 gap-1 text-center font-label-sm text-label-sm text-text-tertiary py-0.5 bg-canvas-base">
<div>-120k</div>
<div>-90k</div>
<div>-60k</div>
<div>-30k</div>
<div class="col-span-4 text-secondary font-bold">CENTER (2245.500 MHz)</div>
<div>+30k</div>
<div>+60k</div>
<div>+90k</div>
<div>+120k</div>
</div>
<!-- RF Waterfall Bars -->
<div class="space-y-1 font-mono text-[10px] text-text-secondary leading-none select-none">
<div class="flex items-center gap-1">
<span class="text-text-tertiary w-12 shrink-0">T-04s</span>
<div class="flex-1 h-3 bg-canvas-base flex items-center overflow-hidden">
<span class="text-text-tertiary">...░░░░▒▒▓▓</span><span class="text-status-nominal font-bold">████████████████████████</span><span class="text-text-tertiary">▓▓▒▒░░░...</span>
</div>
<span class="text-status-nominal w-14 text-right">+18.5dB</span>
</div>
<div class="flex items-center gap-1">
<span class="text-text-tertiary w-12 shrink-0">T-03s</span>
<div class="flex-1 h-3 bg-canvas-base flex items-center overflow-hidden">
<span class="text-text-tertiary">....░░░▒▒▓▓</span><span class="text-status-nominal font-bold">█████████████████████████</span><span class="text-text-tertiary">▓▓▒░░....</span>
</div>
<span class="text-status-nominal w-14 text-right">+18.4dB</span>
</div>
<div class="flex items-center gap-1">
<span class="text-text-tertiary w-12 shrink-0">T-02s</span>
<div class="flex-1 h-3 bg-canvas-base flex items-center overflow-hidden">
<span class="text-text-tertiary">...░░░▒▒▒▓▓</span><span class="text-status-nominal font-bold">████████████████████████</span><span class="text-text-tertiary">▓▓▒▒░░...</span>
</div>
<span class="text-status-nominal w-14 text-right">+18.2dB</span>
</div>
<div class="flex items-center gap-1">
<span class="text-text-tertiary w-12 shrink-0">T-01s</span>
<div class="flex-1 h-3 bg-canvas-base flex items-center overflow-hidden">
<span class="text-text-tertiary">..░░░▒▒▓▓▓</span><span class="text-status-nominal font-bold">██████████████████████████</span><span class="text-text-tertiary">▓▓▒▒░...</span>
</div>
<span class="text-status-nominal w-14 text-right">+18.6dB</span>
</div>
<div class="flex items-center gap-1">
<span class="text-text-tertiary w-12 shrink-0">T-00s</span>
<div class="flex-1 h-3 bg-canvas-base flex items-center overflow-hidden">
<span class="text-text-tertiary">...░░▒▒▓▓▓</span><span class="text-primary font-bold">██████████████████████████</span><span class="text-text-tertiary">▓▓▒▒░░..</span>
</div>
<span class="text-status-nominal w-14 text-right">+18.4dB</span>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- RIGHT COLUMN: Panels 3 & 4 (Diagnostic Stack) -->
<div class="xl:col-span-4 flex flex-col gap-space-sm min-w-0">
<!-- Panel 3: Atmospheric & Space Weather Sensor Oracle (NOAA / Open-Meteo Ingest) -->
<div class="bg-surface-panel flex flex-col">
<div class="h-8 bg-surface-inset px-space-md flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-headline-sm text-status-pending">wb_sunny</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-bold">NOAA / Space Weather Ingest</span>
</div>
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-status-nominal">GFS FEED NOMINAL</span>
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
</div>
</div>
<div class="p-space-md flex flex-col gap-space-md">
<!-- Key Metrics Quad -->
<div class="grid grid-cols-2 gap-space-xs">
<div class="bg-surface-inset p-space-sm flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">Solar Flux (10.7cm)</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-headline-md text-headline-md text-text-primary">148.2</span>
<span class="font-label-sm text-label-sm text-text-secondary">sfu</span>
</div>
<span class="font-label-sm text-label-sm text-status-nominal mt-0.5">NOMINAL (NO SOLAR FLARE)</span>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">Geomagnetic Kp</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-headline-md text-headline-md text-status-nominal">2.1</span>
<span class="font-label-sm text-label-sm text-text-secondary">Kp-INDEX</span>
</div>
<span class="font-label-sm text-label-sm text-secondary mt-0.5">STATUS: QUIET G0</span>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">Tropospheric Attenuation</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-headline-md text-headline-md text-primary">0.02</span>
<span class="font-label-sm text-label-sm text-text-secondary">dB/km</span>
</div>
<span class="font-label-sm text-label-sm text-text-tertiary mt-0.5">X-BAND / S-BAND DRY</span>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">Total Electron Count (TEC)</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-headline-md text-headline-md text-text-primary">22.4</span>
<span class="font-label-sm text-label-sm text-text-secondary">TECU</span>
</div>
<span class="font-label-sm text-label-sm text-status-nominal mt-0.5">IONO DELAY <1.8ns</span>
</div>
</div>
<!-- Real-Time Cloud Cover & Rain Attenuation Geo-Tiles -->
<div class="flex flex-col gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Ground Station Site Weather // GFS Grid Ingest</span>
<div class="flex flex-col font-code-sm text-code-sm divide-y divide-border-default bg-surface-inset">
<div class="p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="h-2 w-2 bg-status-nominal"></span>
<span class="text-text-primary font-label-md text-label-md">Node #189 [Bangalore]</span>
</div>
<div class="flex items-center gap-space-md text-text-secondary">
<span>Cloud: <strong class="text-text-primary">12%</strong></span>
<span>Rain: <strong class="text-status-nominal">0.0 mm/h</strong></span>
<span class="text-status-nominal font-bold">100% CLEAR</span>
</div>
</div>
<div class="p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="h-2 w-2 bg-status-nominal"></span>
<span class="text-text-primary font-label-md text-label-md">Node #244 [Hyderabad]</span>
</div>
<div class="flex items-center gap-space-md text-text-secondary">
<span>Cloud: <strong class="text-text-primary">28%</strong></span>
<span>Rain: <strong class="text-status-nominal">0.0 mm/h</strong></span>
<span class="text-status-nominal font-bold">100% CLEAR</span>
</div>
</div>
<div class="p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="h-2 w-2 bg-status-pending"></span>
<span class="text-text-primary font-label-md text-label-md">Node #312 [Colombo]</span>
</div>
<div class="flex items-center gap-space-md text-text-secondary">
<span>Cloud: <strong class="text-status-pending">84%</strong></span>
<span>Rain: <strong class="text-status-pending">1.4 mm/h</strong></span>
<span class="text-status-pending font-bold">-0.8 dB ATT</span>
</div>
</div>
<div class="p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="h-2 w-2 bg-status-nominal"></span>
<span class="text-text-primary font-label-md text-label-md">Node #402 [Muscat]</span>
</div>
<div class="flex items-center gap-space-md text-text-secondary">
<span>Cloud: <strong class="text-text-primary">2%</strong></span>
<span>Rain: <strong class="text-status-nominal">0.0 mm/h</strong></span>
<span class="text-status-nominal font-bold">OPTIMAL</span>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Panel 4: Chainlink Functions Decryption & Merkle Aggregator -->
<div class="bg-surface-panel flex flex-col">
<div class="h-8 bg-surface-inset px-space-md flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-headline-sm text-secondary">verified</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-bold">Chainlink Oracle & Merkle Aggregator</span>
</div>
<span class="font-label-sm text-label-sm text-hash-spectral font-code-sm">DON: 5/7 QUORUM</span>
</div>
<div class="p-space-md flex flex-col gap-space-md">
<!-- Pass SLA Audit Progress -->
<div class="bg-surface-inset p-space-sm flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">Valid Telemetry SLA Threshold</span>
<span class="font-code-sm text-code-sm text-status-nominal font-bold">99.72% / 99.0% REQ</span>
</div>
<!-- Progress Bar Frame -->
<div class="w-full h-2 bg-canvas-base overflow-hidden">
<div class="h-full bg-status-nominal" style="width: 99.72%;"></div>
</div>
<div class="flex items-center justify-between text-text-secondary font-label-sm text-label-sm pt-0.5">
<span>RX Frames: <strong class="text-text-primary font-code-sm">4,812</strong></span>
<span>Valid FEC: <strong class="text-status-nominal font-code-sm">4,799</strong></span>
<span>Shed/Corrupt: <strong class="text-text-tertiary font-code-sm">13</strong></span>
</div>
</div>
<!-- Merkle Proof Builder & Tree Decomposition -->
<div class="bg-canvas-base p-space-sm font-code-sm text-code-sm flex flex-col gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Merkle Tree Aggregation (256-Leaf DON)</span>
<div class="space-y-1 text-text-secondary text-[11px] leading-tight">
<div class="flex justify-between items-center">
<span class="text-text-tertiary">LEAF #0x01:</span>
<span class="text-primary truncate">0x51ae7c8d...001a</span>
<span class="text-status-nominal">VERIFIED</span>
</div>
<div class="flex justify-between items-center">
<span class="text-text-tertiary">LEAF #0x02:</span>
<span class="text-primary truncate">0x98bb32c0...4f88</span>
<span class="text-status-nominal">VERIFIED</span>
</div>
<div class="flex justify-between items-center">
<span class="text-text-tertiary">PARENT HASH:</span>
<span class="text-hash-spectral truncate">0x22c4d9a1...10e2</span>
<span class="text-secondary">SHA256</span>
</div>
<div class="flex justify-between items-center pt-1 border-t border-border-default">
<span class="text-text-tertiary font-bold">ROOT STATE:</span>
<span class="text-hash-spectral font-bold font-code-sm">0x91f8...33ea</span>
<span class="px-1 bg-surface-inset text-status-nominal font-label-sm text-label-sm">MATCH</span>
</div>
</div>
</div>
<!-- Signed ECDSA Payload & Contract Execution Action -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between text-text-tertiary font-label-sm text-label-sm">
<span>ECDSA ATTESTATION PAYLOAD</span>
<span class="text-text-secondary font-code-sm">v: 27 | r: 0x4a.. | s: 0x81..</span>
</div>
<div class="p-space-xs bg-surface-inset font-code-sm text-code-sm text-text-secondary break-all select-all">
              0x2a91f89c44b821a39f6004b721832048f09231889c33ea00000000000000000000000000000000000000000000000000000000000012cc
            </div>
<div class="flex gap-space-xs mt-1">
<button class="flex-1 bg-status-nominal text-canvas-base font-label-md text-label-md py-1.5 font-bold hover:bg-secondary transition-none uppercase flex items-center justify-center gap-space-xs">
<span class="material-symbols-outlined text-headline-sm">check_circle</span>
                Attest & Settle Escrow
              </button>
<button class="px-space-md bg-surface-inset text-text-secondary hover:text-text-primary hover:bg-surface-panel font-label-sm text-label-sm uppercase transition-none" title="Manual DON Verification Query">
                Query DON
              </button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<script>
  // Micro-interaction: Periodic simulated sub-Hz demodulation row updates
  (function initLiveTelemetry() {
    const nodes = [
      { id: "Node #189", loc: "Bangalore", ant: "3.0m S-Band Dish", snr: "+18.4", dev: "+0.11 kHz", fec: "RS(255,223) OK", bytes: "1,024" },
      { id: "Node #244", loc: "Hyderabad", ant: "VHF/UHF Yagi 2x14", snr: "+14.5", dev: "-0.09 kHz", fec: "LDPC 7/8 PASS", bytes: "512" },
      { id: "Node #312", loc: "Colombo", ant: "2.4m Parabolic", snr: "+10.1", dev: "+0.42 kHz", fec: "RS(255,223) OK", bytes: "1,024" },
      { id: "Node #402", loc: "Muscat", ant: "Quad Helix Array", snr: "+16.3", dev: "-0.01 kHz", fec: "LDPC 7/8 PASS", bytes: "2,048" }
    ];

    const feed = document.getElementById("telemetryFeed");
    if (!feed) return;

    setInterval(() => {
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      
      const newRow = document.createElement("div");
      newRow.className = "grid grid-cols-12 items-center px-space-md py-1.5 hover:bg-surface-inset bg-canvas-base transition-none";
      newRow.innerHTML = \`
        <div class="col-span-2 text-text-secondary">\${timeString}</div>
        <div class="col-span-2 text-text-primary truncate">\${randomNode.id} <span class="text-text-tertiary">\${randomNode.loc}</span></div>
        <div class="col-span-2 text-text-secondary truncate">\${randomNode.ant}</div>
        <div class="col-span-1 text-right text-status-nominal font-bold">\${randomNode.snr}</div>
        <div class="col-span-2 text-right text-text-primary font-code-sm">\${randomNode.dev}</div>
        <div class="col-span-2 flex justify-center">
          <span class="px-1.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">\${randomNode.fec}</span>
        </div>
        <div class="col-span-1 text-right text-hash-spectral">\${randomNode.bytes}</div>
      \`;

      if (feed.firstChild) {
        feed.insertBefore(newRow, feed.firstChild);
      } else {
        feed.appendChild(newRow);
      }

      // Keep maximum 5 rows visible
      while (feed.children.length > 5) {
        feed.removeChild(feed.lastChild);
      }
    }, 2800);
  })();
</script></main>` }} 
    />
  );
}
