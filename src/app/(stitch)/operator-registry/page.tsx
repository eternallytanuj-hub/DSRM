'use client';
export default function Registry() {
  return (
    <div 
      className="select-none h-full w-full"
      dangerouslySetInnerHTML={{ __html: `<main class="relative w-full flex-1 bg-canvas-base"><div class="flex flex-col w-full">
<div class="p-space-lg space-y-space-md">
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-xs bg-surface-panel p-space-sm">
<div class="bg-surface-inset p-space-sm flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Verified Operators</span>
<span class="material-symbols-outlined text-primary text-headline-sm">domain_verification</span>
</div>
<div class="mt-space-xs flex items-baseline gap-space-xs">
<span class="font-headline-lg text-headline-lg text-text-primary tracking-tight">18</span>
<span class="font-label-sm text-label-sm text-status-nominal flex items-center"><span class="h-1.5 w-1.5 bg-status-nominal inline-block mr-1"></span>ALL ACTIVE</span>
</div>
<div class="font-label-sm text-label-sm text-text-secondary mt-0.5">100% KYC/KYB Cleared</div>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Registered Birds</span>
<span class="material-symbols-outlined text-text-secondary text-headline-sm">satellite_alt</span>
</div>
<div class="mt-space-xs flex items-baseline gap-space-xs">
<span class="font-headline-lg text-headline-lg text-text-primary tracking-tight">84</span>
<span class="font-label-sm text-label-sm text-text-secondary">ORBITAL HULLS</span>
</div>
<div class="font-label-sm text-label-sm text-status-nominal mt-0.5">LEO/SSO/MEO Indexed</div>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Licensed Bands</span>
<span class="material-symbols-outlined text-status-nominal text-headline-sm">verified</span>
</div>
<div class="mt-space-xs flex items-baseline gap-space-xs">
<span class="font-headline-lg text-headline-lg text-text-primary tracking-tight">100%</span>
<span class="font-label-sm text-label-sm text-status-nominal">AUDITED</span>
</div>
<div class="font-label-sm text-label-sm text-text-secondary mt-0.5">FCC IBFS + ITU Art. 21</div>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Total Staked Collateral</span>
<span class="material-symbols-outlined text-primary-container text-headline-sm">lock</span>
</div>
<div class="mt-space-xs flex items-baseline gap-space-xs">
<span class="font-headline-md text-headline-md text-text-primary tracking-tight font-code-md">\$2,450,000.00</span>
<span class="font-label-sm text-label-sm text-text-secondary">USDC</span>
</div>
<div class="font-label-sm text-label-sm text-hash-spectral mt-0.5">Multi-Sig Timelock Locked</div>
</div>
<div class="bg-surface-inset p-space-sm flex flex-col justify-between col-span-2 md:col-span-1">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Slashing Claims</span>
<span class="material-symbols-outlined text-status-nominal text-headline-sm">gavel</span>
</div>
<div class="mt-space-xs flex items-baseline gap-space-xs">
<span class="font-headline-lg text-headline-lg text-status-nominal tracking-tight">0</span>
<span class="font-label-sm text-label-sm text-status-nominal font-code-sm">NOMINAL ZERO</span>
</div>
<div class="font-label-sm text-label-sm text-text-secondary mt-0.5">0% Breach Metric Epoch 84</div>
</div>
</div>
<div class="bg-surface-panel p-space-sm flex flex-col lg:flex-row gap-space-sm items-stretch lg:items-center justify-between">
<div class="flex flex-1 items-center gap-space-xs bg-canvas-base px-space-sm py-1">
<span class="material-symbols-outlined text-text-tertiary text-headline-sm">search</span>
<input class="w-full bg-transparent text-text-primary font-code-md text-code-md placeholder:text-text-tertiary focus:outline-none" id="operatorSearchInput" placeholder="SEARCH OPERATOR, CALL SIGN, NORAD ID, FCC FILE #..." type="text"/>
<span class="text-text-tertiary font-label-sm text-label-sm px-1 bg-surface-inset">ESC TO CLEAR</span>
</div>
<div class="flex flex-wrap items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider mr-1">Band Filter:</span>
<button class="band-filter-btn px-space-sm py-1 bg-primary text-canvas-base font-label-sm text-label-sm font-semibold" data-band="ALL">ALL (84)</button>
<button class="band-filter-btn px-space-sm py-1 bg-surface-inset text-text-secondary hover:text-text-primary font-label-sm text-label-sm" data-band="UHF">UHF (430-440MHz)</button>
<button class="band-filter-btn px-space-sm py-1 bg-surface-inset text-text-secondary hover:text-text-primary font-label-sm text-label-sm" data-band="S-BAND">S-BAND (2.2GHz)</button>
<button class="band-filter-btn px-space-sm py-1 bg-surface-inset text-text-secondary hover:text-text-primary font-label-sm text-label-sm" data-band="X-BAND">X-BAND (8.4GHz)</button>
<button class="band-filter-btn px-space-sm py-1 bg-surface-inset text-text-secondary hover:text-text-primary font-label-sm text-label-sm" data-band="KA-BAND">KA-BAND (26GHz)</button>
<button class="band-filter-btn px-space-sm py-1 bg-surface-inset text-text-secondary hover:text-text-primary font-label-sm text-label-sm" data-band="OPTICAL">OPTICAL/LASER</button>
</div>
</div>
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
<div class="xl:col-span-8 flex flex-col space-y-space-md">
<div class="bg-surface-panel overflow-hidden">
<div class="h-8 px-space-sm bg-surface-inset flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-headline-sm">table_chart</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-semibold">Institutional Operator Clearing Ledger</span>
<span class="text-text-tertiary font-code-sm text-code-sm">[ITU RR ART 21 / FCC IBFS LIVE]</span>
</div>
<div class="flex items-center gap-space-sm font-label-sm text-label-sm">
<span class="text-text-tertiary">SYNC PULSE:</span>
<span class="text-status-nominal font-code-sm">1.04s</span>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left" id="operatorLedgerTable">
<thead>
<tr class="bg-surface-inset font-label-sm text-label-sm text-text-tertiary uppercase">
<th class="py-2 px-space-sm">Operator / Primary Hulls</th>
<th class="py-2 px-space-sm">FCC Sign / IBFS Docket</th>
<th class="py-2 px-space-sm">ITU Allocation (Band)</th>
<th class="py-2 px-space-sm text-right">Collateral Staked</th>
<th class="py-2 px-space-sm text-center">SLA Reliability</th>
<th class="py-2 px-space-sm text-center">Debris Metric</th>
<th class="py-2 px-space-sm text-center">Action</th>
</tr>
</thead>
<tbody class="font-body-sm text-body-sm divide-y divide-border-default/0">
<tr class="operator-row bg-surface-panel hover:bg-surface-inset transition-none cursor-pointer" onclick="selectOperator('ORBITEX')">
<td class="py-2.5 px-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary flex items-center gap-1.5">
<span class="h-2 w-2 bg-status-nominal inline-block"></span>
                      ORBITEX AEROSPACE
                    </div>
<div class="font-code-sm text-code-sm text-text-secondary mt-0.5">Hulls: SAT-07, SAT-12, SAT-19 [LEO SSO]</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<div class="text-primary font-semibold">WH9XST</div>
<div class="text-text-tertiary">#0241-EX-CN-2024 (EXP 2028)</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<span class="px-1 py-0.5 bg-status-active-surface text-status-active font-label-sm text-label-sm">S-BAND</span>
<div class="text-text-secondary mt-0.5">2200 - 2290 MHz Earth Expl.</div>
</td>
<td class="py-2.5 px-space-sm text-right font-code-sm text-code-sm">
<div class="text-text-primary font-semibold">\$50,000.00 USDC</div>
<div class="text-hash-spectral text-label-sm font-label-sm">0x82a9...df34</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<div class="font-code-sm text-code-sm text-status-nominal font-semibold">99.4%</div>
<div class="text-text-tertiary font-label-sm text-label-sm">142 PASSES / 0 SLASH</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<span class="px-1 py-0.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">ODMSP REV-A</span>
<div class="text-text-tertiary font-label-sm text-label-sm mt-0.5">25-YR DEORBIT CERT</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<button class="px-space-sm py-1 bg-surface-inset text-primary hover:bg-primary hover:text-canvas-base font-label-sm text-label-sm font-semibold">AUDIT</button>
</td>
</tr>
<tr class="operator-row bg-surface-container-low hover:bg-surface-inset transition-none cursor-pointer" onclick="selectOperator('MERIDIAN')">
<td class="py-2.5 px-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary flex items-center gap-1.5">
<span class="h-2 w-2 bg-status-nominal inline-block"></span>
                      MERIDIAN SPACE NETWORKS
                    </div>
<div class="font-code-sm text-code-sm text-text-secondary mt-0.5">Hulls: METEOSAT-X, MS-SYNTH-01 [LEO Polar]</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<div class="text-primary font-semibold">WQ7ZAA</div>
<div class="text-text-tertiary">#SAT-AMD-2023 (IBFS Verified)</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<span class="px-1 py-0.5 bg-status-active-surface text-status-active font-label-sm text-label-sm">X-BAND</span>
<div class="text-text-secondary mt-0.5">8025 - 8400 MHz Earth Expl.</div>
</td>
<td class="py-2.5 px-space-sm text-right font-code-sm text-code-sm">
<div class="text-text-primary font-semibold">\$120,000.00 USDC</div>
<div class="text-hash-spectral text-label-sm font-label-sm">0x3b11...99e2</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<div class="font-code-sm text-code-sm text-status-nominal font-semibold">99.8%</div>
<div class="text-text-tertiary font-label-sm text-label-sm">318 PASSES / 0 SLASH</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<span class="px-1 py-0.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">ISO 24113</span>
<div class="text-text-tertiary font-label-sm text-label-sm mt-0.5">CONTROLLED RE-ENTRY</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<button class="px-space-sm py-1 bg-surface-inset text-primary hover:bg-primary hover:text-canvas-base font-label-sm text-label-sm font-semibold">AUDIT</button>
</td>
</tr>
<tr class="operator-row bg-surface-panel hover:bg-surface-inset transition-none cursor-pointer" onclick="selectOperator('HELIOSAT')">
<td class="py-2.5 px-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary flex items-center gap-1.5">
<span class="h-2 w-2 bg-status-nominal inline-block"></span>
                      HELIOSAT DYNAMICS
                    </div>
<div class="font-code-sm text-code-sm text-text-secondary mt-0.5">Hulls: CUBE-4, CUBE-5 [LEO Walker Delta]</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<div class="text-primary font-semibold">WK2XPL</div>
<div class="text-text-tertiary">ITU-BR IFIC 2988 Section II</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<span class="px-1 py-0.5 bg-status-active-surface text-status-active font-label-sm text-label-sm">UHF</span>
<div class="text-text-secondary mt-0.5">435 - 438 MHz Telemetry</div>
</td>
<td class="py-2.5 px-space-sm text-right font-code-sm text-code-sm">
<div class="text-text-primary font-semibold">\$25,000.00 USDC</div>
<div class="text-hash-spectral text-label-sm font-label-sm">0x1a8f...00cd</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<div class="font-code-sm text-code-sm text-status-nominal font-semibold">98.6%</div>
<div class="text-text-tertiary font-label-sm text-label-sm">88 PASSES / 0 SLASH</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<span class="px-1 py-0.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">AEROSPACE REV-4</span>
<div class="text-text-tertiary font-label-sm text-label-sm mt-0.5">ATMOSPHERIC DRAG-SAIL</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<button class="px-space-sm py-1 bg-surface-inset text-primary hover:bg-primary hover:text-canvas-base font-label-sm text-label-sm font-semibold">AUDIT</button>
</td>
</tr>
<tr class="operator-row bg-surface-container-low hover:bg-surface-inset transition-none cursor-pointer" onclick="selectOperator('AETHON')">
<td class="py-2.5 px-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary flex items-center gap-1.5">
<span class="h-2 w-2 bg-status-nominal inline-block"></span>
                      AETHON PHOTONICS CONSTEL
                    </div>
<div class="font-code-sm text-code-sm text-text-secondary mt-0.5">Hulls: OPTIC-SAT-01, OPTIC-02 [Polar 550km]</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<div class="text-primary font-semibold">WN8XAO</div>
<div class="text-text-tertiary">#0891-EX-CN-2023 (Optical Rx)</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<span class="px-1 py-0.5 bg-hash-spectral/20 text-hash-spectral font-label-sm text-label-sm">OPTICAL</span>
<div class="text-text-secondary mt-0.5">1550nm Laser Downlink 10Gbps</div>
</td>
<td class="py-2.5 px-space-sm text-right font-code-sm text-code-sm">
<div class="text-text-primary font-semibold">\$350,000.00 USDC</div>
<div class="text-hash-spectral text-label-sm font-label-sm">0x9c41...ee51</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<div class="font-code-sm text-code-sm text-status-nominal font-semibold">99.9%</div>
<div class="text-text-tertiary font-label-sm text-label-sm">62 PASSES / 0 SLASH</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<span class="px-1 py-0.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">ODMSP REV-A</span>
<div class="text-text-tertiary font-label-sm text-label-sm mt-0.5">ION PROPULSION RETIRE</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<button class="px-space-sm py-1 bg-surface-inset text-primary hover:bg-primary hover:text-canvas-base font-label-sm text-label-sm font-semibold">AUDIT</button>
</td>
</tr>
<tr class="operator-row bg-surface-panel hover:bg-surface-inset transition-none cursor-pointer" onclick="selectOperator('KORE_SAT')">
<td class="py-2.5 px-space-sm">
<div class="font-headline-sm text-headline-sm text-text-primary flex items-center gap-1.5">
<span class="h-2 w-2 bg-status-nominal inline-block"></span>
                      KORE TELECOMMUNICATIONS
                    </div>
<div class="font-code-sm text-code-sm text-text-secondary mt-0.5">Hulls: KA-RELAY-1 through 4 [MEO Equat]</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<div class="text-primary font-semibold">WP4ZRT</div>
<div class="text-text-tertiary">#SAT-LOA-20220615-00054</div>
</td>
<td class="py-2.5 px-space-sm font-code-sm text-code-sm">
<span class="px-1 py-0.5 bg-status-active-surface text-status-active font-label-sm text-label-sm">KA-BAND</span>
<div class="text-text-secondary mt-0.5">26.5 - 29.0 GHz Fixed Sat</div>
</td>
<td class="py-2.5 px-space-sm text-right font-code-sm text-code-sm">
<div class="text-text-primary font-semibold">\$800,000.00 USDC</div>
<div class="text-hash-spectral text-label-sm font-label-sm">0x55dc...a117</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<div class="font-code-sm text-code-sm text-status-nominal font-semibold">99.7%</div>
<div class="text-text-tertiary font-label-sm text-label-sm">540 PASSES / 0 SLASH</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<span class="px-1 py-0.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">FCC PART 25</span>
<div class="text-text-tertiary font-label-sm text-label-sm mt-0.5">GRAVEYARD DISPOSAL 300KM</div>
</td>
<td class="py-2.5 px-space-sm text-center">
<button class="px-space-sm py-1 bg-surface-inset text-primary hover:bg-primary hover:text-canvas-base font-label-sm text-label-sm font-semibold">AUDIT</button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="h-8 px-space-sm bg-surface-inset flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>DISPLAYING 5 OF 18 ENTITIES IN VERIFIED CLEARING REGISTRY</span>
<div class="flex items-center gap-space-sm">
<span class="text-text-secondary">PAGE 1 / 4</span>
<button class="px-2 py-0.5 bg-canvas-base text-text-secondary hover:text-text-primary font-code-sm text-code-sm">PREV</button>
<button class="px-2 py-0.5 bg-canvas-base text-text-secondary hover:text-text-primary font-code-sm text-code-sm">NEXT</button>
</div>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div class="bg-surface-panel p-space-md">
<div class="flex items-center justify-between pb-space-sm mb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-hash-spectral text-headline-sm">account_balance</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-semibold">Proof of Operator Reserves (PoR)</span>
</div>
<span class="font-label-sm text-label-sm px-1.5 py-0.5 bg-status-nominal-surface text-status-nominal font-code-sm">DON QUORUM 7/7</span>
</div>
<div class="space-y-space-sm">
<div class="p-space-sm bg-surface-inset">
<div class="flex items-center justify-between text-label-sm font-label-sm">
<span class="text-text-tertiary">CHAINLINK POR FEED (AGGREGATOR-V3):</span>
<span class="text-primary font-code-sm">0x814f...D71a</span>
</div>
<div class="flex items-baseline justify-between mt-1">
<span class="text-text-secondary font-body-sm text-body-sm">Verified Escrow Balance:</span>
<span class="font-code-md text-code-md text-status-nominal font-semibold">\$2,450,000.00 USDC</span>
</div>
<div class="flex items-center justify-between mt-1 text-label-sm font-label-sm">
<span class="text-text-tertiary">Last Heartbeat Round #189,422:</span>
<span class="text-text-secondary font-code-sm">18.4s AGO [ROUND SATISFIED]</span>
</div>
</div>
<div class="p-space-sm bg-surface-inset space-y-1">
<div class="flex justify-between font-label-sm text-label-sm">
<span class="text-text-tertiary">MULTI-SIG ESCROW SIGNERS:</span>
<span class="text-status-nominal font-code-sm">3 of 5 THRESHOLD</span>
</div>
<div class="font-code-sm text-code-sm text-text-secondary">VAULT ROOT: <span class="text-hash-spectral">0xFE918820B1A429CDE801</span></div>
<div class="font-label-sm text-label-sm text-text-tertiary">STAKE UNWIND LOCK PERIOD: 14 DAYS COOLDOWN VIA TIMELOCK CONTROLLER</div>
</div>
</div>
</div>
<div class="bg-surface-panel p-space-md">
<div class="flex items-center justify-between pb-space-sm mb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-headline-sm">satellite</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-semibold">Telemetry & NORAD Cross-Validation</span>
</div>
<span class="font-label-sm text-label-sm text-status-nominal flex items-center"><span class="h-1.5 w-1.5 bg-status-nominal inline-block mr-1"></span>LIVE</span>
</div>
<div class="space-y-space-sm">
<div class="p-space-sm bg-surface-inset">
<div class="flex items-center justify-between text-label-sm font-label-sm">
<span class="text-text-tertiary">NORAD TLE FEED:</span>
<span class="text-text-primary font-code-sm">SPACE-TRACK.ORG REST API v2</span>
</div>
<div class="text-code-sm font-code-sm text-text-secondary mt-1">
                  TLE INGEST: 84/84 IDENTIFIED BIRDS IN NOMINAL TRACK CORRIDOR
                </div>
<div class="flex items-center justify-between mt-1 text-label-sm font-label-sm">
<span class="text-text-tertiary">Conjunction Risk Level (CDM):</span>
<span class="text-status-nominal font-code-sm">Pc < 10⁻⁷ [CLEAR]</span>
</div>
</div>
<div class="p-space-sm bg-surface-inset">
<div class="flex items-center justify-between text-label-sm font-label-sm">
<span class="text-text-tertiary">SatNOGS OBSERVATION CORRELATION:</span>
<span class="text-status-nominal font-code-sm">100% CORRELATED</span>
</div>
<div class="text-label-sm font-label-sm text-text-secondary mt-1">
                  Automatic Doppler beacon verification active across 418 ground stations.
                </div>
</div>
</div>
</div>
</div>
</div>
<div class="xl:col-span-4 flex flex-col space-y-space-md">
<div class="bg-surface-panel overflow-hidden">
<div class="h-8 px-space-sm bg-surface-inset flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-status-breach text-headline-sm">shield_with_heart</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-semibold">Autonomous Slashing Engine</span>
</div>
<span class="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-panel text-primary font-code-sm">CLEARING v2.4</span>
</div>
<div class="p-space-sm space-y-space-sm">
<div class="p-space-sm bg-surface-inset">
<div class="flex items-center justify-between">
<span class="font-headline-sm text-headline-sm text-text-primary">PASS BREACH (> 2 MIN LATE)</span>
<span class="px-1.5 py-0.5 bg-status-pending-surface text-status-pending font-label-sm text-label-sm font-semibold">-20% COLLATERAL</span>
</div>
<div class="text-body-sm font-body-sm text-text-secondary mt-1">
                If RF downlink acquisition occurs >120s past Scheduled AOS without prior operator notice (4hr minimum advance), oracle initiates immediate 20% stake slash to compensator pool.
              </div>
<div class="mt-2 flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>ORACLE ARBITER: <span class="text-text-primary font-code-sm">SatNOGS Doppler Lock</span></span>
<span>STATUS: <span class="text-status-nominal font-code-sm">NOMINAL</span></span>
</div>
</div>
<div class="p-space-sm bg-surface-inset">
<div class="flex items-center justify-between">
<span class="font-headline-sm text-headline-sm text-text-primary">THROUGHPUT SHORTFALL (> 10%)</span>
<span class="px-1.5 py-0.5 bg-status-breach-surface text-status-breach font-label-sm text-label-sm font-semibold">-50% COLLATERAL</span>
</div>
<div class="text-body-sm font-body-sm text-text-secondary mt-1">
                Delivered packet byte count falls below 90% of committed bandwidth envelope certified by ground station decoders. Multi-sig transfers 50% penalty to renter escrow.
              </div>
<div class="mt-2 flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>VERIFIER: <span class="text-text-primary font-code-sm">Merkle Root Packet Ingest</span></span>
<span>STATUS: <span class="text-status-nominal font-code-sm">NOMINAL</span></span>
</div>
</div>
<div class="p-space-sm bg-surface-inset">
<div class="flex items-center justify-between">
<span class="font-headline-sm text-headline-sm text-text-primary">PIRATE / UNLICENSED EMISSION</span>
<span class="px-1.5 py-0.5 bg-status-breach-surface text-status-breach font-label-sm text-label-sm font-semibold">100% BURN + DE-REG</span>
</div>
<div class="text-body-sm font-body-sm text-text-secondary mt-1">
                RF transmission detected outside coordinated ITU Art. 21 mask or FCC authorized center frequency. Immediate permanent slash of total stake & blacklisting of operator key.
              </div>
<div class="mt-2 flex items-center justify-between font-label-sm text-label-sm text-text-tertiary">
<span>ORACLE: <span class="text-text-primary font-code-sm">ITU / FCC SDR Spectral Feed</span></span>
<span>STATUS: <span class="text-status-nominal font-code-sm">ZERO BREACH</span></span>
</div>
</div>
</div>
</div>
<div class="bg-surface-panel overflow-hidden" id="selectedOperatorCard">
<div class="h-8 px-space-sm bg-surface-inset flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-headline-sm">radar</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary font-semibold">Inspected Dossier</span>
</div>
<span class="font-code-sm text-code-sm text-primary" id="dossierCode">ORBITEX // WH9XST</span>
</div>
<div class="p-space-sm space-y-space-sm">
<div class="flex items-center justify-between p-space-sm bg-surface-inset">
<div>
<div class="font-headline-md text-headline-md text-text-primary" id="dossierName">ORBITEX AEROSPACE LLC</div>
<div class="font-code-sm text-code-sm text-text-secondary" id="dossierSub">LEO Sun-Synchronous | 3 Deployed Hulls</div>
</div>
<span class="px-2 py-0.5 bg-status-nominal-surface text-status-nominal font-label-sm text-label-sm font-semibold">CLEARED</span>
</div>
<div class="space-y-1 font-label-sm text-label-sm p-space-sm bg-surface-inset">
<div class="flex justify-between py-0.5">
<span class="text-text-tertiary">FCC Call Sign / License:</span>
<span class="text-text-primary font-code-sm" id="dossierCallsign">WH9XST (ELS File #0241-EX-CN-2024)</span>
</div>
<div class="flex justify-between py-0.5">
<span class="text-text-tertiary">ITU Article 21 Allocation:</span>
<span class="text-text-primary font-code-sm" id="dossierItu">2200-2290 MHz (Space Operation)</span>
</div>
<div class="flex justify-between py-0.5">
<span class="text-text-tertiary">Debris Mitigation Standard:</span>
<span class="text-status-nominal font-code-sm" id="dossierDebris">ODMSP REV-A (25-Year Certified)</span>
</div>
<div class="flex justify-between py-0.5">
<span class="text-text-tertiary">Active Collateral Staked:</span>
<span class="text-primary font-code-sm" id="dossierCollateral">\$50,000.00 USDC (0x82a9...df34)</span>
</div>
<div class="flex justify-between py-0.5">
<span class="text-text-tertiary">Verified Passes Delivered:</span>
<span class="text-text-primary font-code-sm" id="dossierPasses">142 Successful (0 Slashed)</span>
</div>
<div class="flex justify-between py-0.5">
<span class="text-text-tertiary">Carrier Tracking Frequency:</span>
<span class="text-text-primary font-code-sm" id="dossierCarrier">2245.000 MHz (RHCP Polarized)</span>
</div>
<div class="flex justify-between py-0.5">
<span class="text-text-tertiary">Cryptographic Key Signer:</span>
<span class="text-hash-spectral font-code-sm" id="dossierKey">secp256k1:0x41ab89d9e2</span>
</div>
</div>
<div class="p-space-sm bg-surface-inset flex flex-col gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary uppercase">FCC IBFS / ITU Art. 21 Regulatory Hash</span>
<div class="font-code-sm text-code-sm text-text-primary bg-canvas-base p-1.5 break-all select-all" id="dossierHash">
                0x91F843BA9B0138C421EE62879DC04E09115CA93701BF884E0128B9361093DF82
              </div>
<div class="flex items-center justify-between text-label-sm font-label-sm text-status-nominal">
<span>EIP-712 ATTESTED</span>
<span>CHAINLINK MERKLE ANCHOR CONFIRMED</span>
</div>
</div>
<div class="grid grid-cols-2 gap-space-xs pt-space-xs">
<button class="px-space-sm py-2 bg-surface-inset text-text-primary hover:bg-surface-panel font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1" onclick="downloadRegulatoryReport()">
<span class="material-symbols-outlined text-headline-sm">download</span>
                EXPORT AUDIT PDF
              </button>
<button class="px-space-sm py-2 bg-primary text-canvas-base hover:bg-primary-container font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1" onclick="verifyOnChainProof()">
<span class="material-symbols-outlined text-headline-sm">verified_user</span>
                VERIFY ON-CHAIN
              </button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<script>
  const OPERATORS_DATA = {
    ORBITEX: {
      name: "ORBITEX AEROSPACE LLC",
      sub: "LEO Sun-Synchronous | 3 Deployed Hulls",
      code: "ORBITEX // WH9XST",
      callsign: "WH9XST (ELS File #0241-EX-CN-2024)",
      itu: "2200-2290 MHz (Space Operation)",
      debris: "ODMSP REV-A (25-Year Certified)",
      collateral: "\$50,000.00 USDC (0x82a9...df34)",
      passes: "142 Successful (0 Slashed)",
      carrier: "2245.000 MHz (RHCP Polarized)",
      key: "secp256k1:0x41ab89d9e2",
      hash: "0x91F843BA9B0138C421EE62879DC04E09115CA93701BF884E0128B9361093DF82"
    },
    MERIDIAN: {
      name: "MERIDIAN SPACE NETWORKS",
      sub: "LEO Polar Orbit | 2 Deployed Hulls",
      code: "MERIDIAN // WQ7ZAA",
      callsign: "WQ7ZAA (#SAT-AMD-2023 IBFS Verified)",
      itu: "8025-8400 MHz (Earth Exploration)",
      debris: "ISO 24113 Controlled Atmospheric Re-entry",
      collateral: "\$120,000.00 USDC (0x3b11...99e2)",
      passes: "318 Successful (0 Slashed)",
      carrier: "8215.500 MHz (LHCP High-Rate Downlink)",
      key: "secp256k1:0x98bb77a102",
      hash: "0x38AF401C990145DBEA33201416EEB91104C20875AE004581C8299A10098F3921"
    },
    HELIOSAT: {
      name: "HELIOSAT DYNAMICS",
      sub: "LEO Walker Delta | 2 CubeSats Deployed",
      code: "HELIOSAT // WK2XPL",
      callsign: "WK2XPL (ITU-BR IFIC 2988 Section II)",
      itu: "435-438 MHz (Telemetry/Tracking)",
      debris: "AEROSPACE REV-4 Atmospheric Drag-Sail",
      collateral: "\$25,000.00 USDC (0x1a8f...00cd)",
      passes: "88 Successful (0 Slashed)",
      carrier: "436.850 MHz (AFSK 9600 Telemetry)",
      key: "secp256k1:0x5e449a0021",
      hash: "0x77EA8821034BBC099120EA7741300908851BFF87019238472910AA844001920B"
    },
    AETHON: {
      name: "AETHON PHOTONICS CONSTEL",
      sub: "Polar 550km Orbit | 2 Optical Nodes",
      code: "AETHON // WN8XAO",
      callsign: "WN8XAO (#0891-EX-CN-2023 Optical Downlink)",
      itu: "1550nm Laser Spectrum Non-Interference",
      debris: "ODMSP REV-A Low Altitude Orbit Self-Clean",
      collateral: "\$350,000.00 USDC (0x9c41...ee51)",
      passes: "62 Successful (0 Slashed)",
      carrier: "1550 nm Wavelength 10 Gbps QPSK",
      key: "secp256k1:0x22fbc19984",
      hash: "0xBB019247A99DCE8817208819001AB8829C44108871092451AA9908123C004812"
    },
    KORE_SAT: {
      name: "KORE TELECOMMUNICATIONS",
      sub: "MEO Equatorial Relay | 4 Satellite Constellation",
      code: "KORE // WP4ZRT",
      callsign: "WP4ZRT (#SAT-LOA-20220615-00054)",
      itu: "26.5-29.0 GHz (Fixed Satellite Ka-Band)",
      debris: "FCC PART 25 Graveyard Orbital Slot (+300km)",
      collateral: "\$800,000.00 USDC (0x55dc...a117)",
      passes: "540 Successful (0 Slashed)",
      carrier: "28.350 GHz Multi-Beam Phased Array",
      key: "secp256k1:0x77dcca1824",
      hash: "0x1108FEBC99410A1192004455829100BBEE4471900827361920AA0182410948FF"
    }
  };

  function selectOperator(key) {
    const data = OPERATORS_DATA[key];
    if (!data) return;

    document.getElementById('dossierCode').textContent = data.code;
    document.getElementById('dossierName').textContent = data.name;
    document.getElementById('dossierSub').textContent = data.sub;
    document.getElementById('dossierCallsign').textContent = data.callsign;
    document.getElementById('dossierItu').textContent = data.itu;
    document.getElementById('dossierDebris').textContent = data.debris;
    document.getElementById('dossierCollateral').textContent = data.collateral;
    document.getElementById('dossierPasses').textContent = data.passes;
    document.getElementById('dossierCarrier').textContent = data.carrier;
    document.getElementById('dossierKey').textContent = data.key;
    document.getElementById('dossierHash').textContent = data.hash;

    const card = document.getElementById('selectedOperatorCard');
    card.classList.remove('bg-surface-panel');
    card.classList.add('bg-surface-inset');
    setTimeout(() => {
      card.classList.remove('bg-surface-inset');
      card.classList.add('bg-surface-panel');
    }, 150);
  }

  const searchInput = document.getElementById('operatorSearchInput');
  const rows = document.querySelectorAll('.operator-row');

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      if (text.includes(term)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      rows.forEach(r => r.style.display = '');
    }
  });

  const filterBtns = document.querySelectorAll('.band-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-primary', 'text-canvas-base', 'font-semibold');
        b.classList.add('bg-surface-inset', 'text-text-secondary');
      });
      btn.classList.remove('bg-surface-inset', 'text-text-secondary');
      btn.classList.add('bg-primary', 'text-canvas-base', 'font-semibold');

      const band = btn.getAttribute('data-band');
      rows.forEach(row => {
        if (band === 'ALL') {
          row.style.display = '';
        } else {
          const rowText = row.innerText.toUpperCase();
          if (rowText.includes(band)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        }
      });
    });
  });

  function downloadRegulatoryReport() {
    const code = document.getElementById('dossierCode').textContent;
    alert("DSRM DISPATCH: Generating Cryptographic Compliance Dossier [" + code + "] with FCC IBFS Seal & Merkle Proof verification bundle.");
  }

  function verifyOnChainProof() {
    const hash = document.getElementById('dossierHash').textContent.trim();
    alert("CHAINLINK DON VERIFIED: Merkle Root " + hash.substring(0, 16) + "... confirmed on Sepolia Block #6,892,104. Zero non-conformance flags.");
  }
</script></main>` }} 
    />
  );
}
