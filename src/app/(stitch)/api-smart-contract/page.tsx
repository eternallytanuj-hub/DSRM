'use client';
export default function APIEngine() {
  return (
    <div 
      className="select-none h-full w-full"
      dangerouslySetInnerHTML={{ __html: `<main class="relative w-full flex-1 bg-canvas-base"><div class="flex flex-col w-full">
<!-- Developer Sub-Header Navigation & Realtime Pulse Deck -->
<section class="bg-surface-panel p-space-md flex flex-wrap items-center justify-between gap-y-space-sm">
<div class="flex flex-wrap items-center gap-space-lg">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-headline-sm">terminal</span>
<span class="font-label-md text-label-md text-text-primary uppercase tracking-wider font-semibold">DSRM KERNEL INTERFACE // v2.4-DEV</span>
</div>
<div class="h-4 w-px bg-surface-container-highest"></div>
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">NETWORK:</span>
<span class="font-code-sm text-code-sm text-text-primary">ETHEREUM SEPOLIA (11155111)</span>
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
</div>
<div class="h-4 w-px bg-surface-container-highest"></div>
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">ESCROW CONTRACT:</span>
<a class="font-code-sm text-code-sm text-primary hover:underline flex items-center gap-0.5" href="#abi-explorer">
<span>0x7f9a2b8e...4B12</span>
<span class="material-symbols-outlined text-[12px] text-text-tertiary">open_in_new</span>
</a>
</div>
<div class="h-4 w-px bg-surface-container-highest"></div>
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">CHAINLINK DON ID:</span>
<span class="font-code-sm text-code-sm text-hash-spectral">fun-sepolia-1</span>
</div>
</div>
<div class="flex items-center gap-space-md">
<div class="bg-surface-inset px-space-sm py-0.5 flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">DON PEERS:</span>
<span class="font-code-sm text-code-sm text-status-nominal font-semibold">7/7 ONLINE</span>
<span class="h-1.5 w-1.5 bg-status-nominal animate-ping"></span>
</div>
<div class="bg-surface-inset px-space-sm py-0.5 flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">AGENT RPC:</span>
<span class="font-code-sm text-code-sm text-secondary">REST / gRPC NOMINAL</span>
</div>
<div class="bg-status-nominal-surface px-space-sm py-0.5 flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[14px] text-status-nominal">verified</span>
<span class="font-label-sm text-label-sm text-status-nominal font-semibold tracking-wider">SOLC 0.8.24 VERIFIED</span>
</div>
</div>
</section>
<!-- Main Multi-Deck Dev Ops Cockpit -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-gutter p-gutter-desktop">
<!-- LEFT COLUMN: Smart Contract ABI Explorer & Realtime Settlement Invocator (5 Cols) -->
<div class="xl:col-span-5 flex flex-col gap-gutter">
<!-- Contract State & Source Proof Header -->
<div class="bg-surface-panel flex flex-col">
<div class="h-7 bg-surface-inset px-space-md flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-text-secondary text-[14px]">token</span>
<span class="font-label-md text-label-md text-text-secondary uppercase">DSRMEscrowClearinghouse.sol</span>
</div>
<div class="flex items-center gap-space-sm">
<span class="font-label-sm text-label-sm text-text-tertiary">PROXY:</span>
<span class="font-code-sm text-code-sm text-text-primary">ERC-1967 (UUPS)</span>
</div>
</div>
<div class="p-space-md bg-surface-panel flex flex-col gap-space-sm">
<div class="grid grid-cols-3 gap-space-xs bg-surface-inset p-space-sm">
<div>
<span class="font-label-sm text-label-sm text-text-tertiary block">SLOT ESCROW POOL</span>
<span class="font-code-md text-code-md text-text-primary font-semibold">1,482,900.00 <span class="text-text-tertiary font-label-sm">USDC</span></span>
</div>
<div>
<span class="font-label-sm text-label-sm text-text-tertiary block">SETTLE AVG GAS</span>
<span class="font-code-md text-code-md text-status-active font-semibold">64,218 <span class="text-text-tertiary font-label-sm">GAS</span></span>
</div>
<div>
<span class="font-label-sm text-label-sm text-text-tertiary block">SLASHED SLA</span>
<span class="font-code-md text-code-md text-status-breach font-semibold">0.00 <span class="text-text-tertiary font-label-sm">USDC</span></span>
</div>
</div>
<!-- Function Selector Filter -->
<div class="flex items-center justify-between pt-space-xs">
<span class="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">EXECUTE ABI METHODS (WRITE)</span>
<span class="font-code-sm text-code-sm text-text-tertiary">4 EXTERNAL MUTATING</span>
</div>
<!-- Contract Methods List Accordion -->
<div class="flex flex-col gap-space-xs">
<!-- Method 1: createEscrowWindow -->
<div class="bg-surface-inset p-space-sm flex flex-col gap-space-xs" id="method-container-1">
<button class="w-full flex items-center justify-between text-left hover:text-primary transition-none" onclick="toggleMethod('method-body-1')" type="button">
<div class="flex items-center gap-space-sm">
<span class="bg-status-active-surface text-status-active font-code-sm text-code-sm px-1 py-0.5">#01</span>
<span class="font-code-sm text-code-sm text-text-primary font-semibold">createEscrowWindow</span>
</div>
<span class="font-label-sm text-label-sm text-text-tertiary flex items-center gap-1">
<span>EXPENSES 104k GAS</span>
<span class="material-symbols-outlined text-[14px]">expand_more</span>
</span>
</button>
<div class="flex flex-col gap-space-xs pt-space-xs" id="method-body-1">
<div class="font-label-sm text-label-sm text-text-tertiary">
                  Instantiates non-custodial orbital access window and locks buyer collateral in USDC.
                </div>
<div class="grid grid-cols-2 gap-space-xs">
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">uint256 noradId</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none focus:bg-surface-panel" id="input-norad" placeholder="e.g. 25544 (ISS)" type="text" value="25544"/>
</div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">uint256 amountUSDC (6 dec)</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none focus:bg-surface-panel" id="input-amount" placeholder="350000000" type="text" value="350000000"/>
</div>
</div>
<div class="grid grid-cols-2 gap-space-xs">
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">uint256 aos (UNIX UTC)</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none focus:bg-surface-panel" id="input-aos" type="text" value="1744483329"/>
</div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">uint256 los (UNIX UTC)</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none focus:bg-surface-panel" id="input-los" type="text" value="1744483989"/>
</div>
</div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">address operator</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none focus:bg-surface-panel" id="input-operator" type="text" value="0x34293f9C128DeAc5d506AcEb0AcFF3Ce056e40Eb"/>
</div>
<div class="flex items-center justify-between pt-space-xs">
<span class="font-code-sm text-code-sm text-text-tertiary">EST. GAS: ~104,192 GWEI</span>
<button class="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase font-bold px-space-md py-1 flex items-center gap-1 transition-none" onclick="simulateCall('createEscrowWindow')" type="button">
<span class="material-symbols-outlined text-[14px]">play_arrow</span>
<span>RUN CALL</span>
</button>
</div>
</div>
</div>
<!-- Method 2: submitAttestationQuorum -->
<div class="bg-surface-inset p-space-sm flex flex-col gap-space-xs">
<button class="w-full flex items-center justify-between text-left hover:text-primary transition-none" onclick="toggleMethod('method-body-2')" type="button">
<div class="flex items-center gap-space-sm">
<span class="bg-status-active-surface text-status-active font-code-sm text-code-sm px-1 py-0.5">#02</span>
<span class="font-code-sm text-code-sm text-text-primary font-semibold">submitAttestationQuorum</span>
</div>
<span class="font-label-sm text-label-sm text-text-tertiary flex items-center gap-1">
<span>EXPENSES 82k GAS</span>
<span class="material-symbols-outlined text-[14px]">expand_more</span>
</span>
</button>
<div class="hidden flex-col gap-space-xs pt-space-xs" id="method-body-2">
<div class="font-label-sm text-label-sm text-text-tertiary">
                  Transmits Chainlink DON threshold aggregate signatures validating RF carrier telemetry & SNR compliance.
                </div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">bytes32 passId</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none" type="text" value="0x9a8f2190c102bf9214b780ac9d5e30fa8e7d21b456e792c3d0b2f15a9e334510"/>
</div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">bytes32 merkleRoot</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-hash-spectral focus:outline-none" type="text" value="0xb7c89f1092a43fe908234125bcf8e0192305a4df021b369adff021e1029cba21"/>
</div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">bytes[] donSignatures (5/7 SECP256k1 Array)</label>
<textarea class="w-full bg-canvas-base p-space-xs font-code-sm text-code-sm text-text-secondary focus:outline-none resize-none" rows="2">[0x3a4f...e102, 0x8b12...c442, 0x90f2...ad11, 0xef10...0922, 0x67aa...3341]</textarea>
</div>
<div class="flex items-center justify-between pt-space-xs">
<span class="font-code-sm text-code-sm text-text-tertiary">ORACLE VERIFICATION QUORUM: 5/7</span>
<button class="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase font-bold px-space-md py-1 flex items-center gap-1 transition-none" onclick="simulateCall('submitAttestationQuorum')" type="button">
<span class="material-symbols-outlined text-[14px]">send</span>
<span>BROADCAST QUORUM</span>
</button>
</div>
</div>
</div>
<!-- Method 3: executeSettlement -->
<div class="bg-surface-inset p-space-sm flex flex-col gap-space-xs">
<button class="w-full flex items-center justify-between text-left hover:text-primary transition-none" onclick="toggleMethod('method-body-3')" type="button">
<div class="flex items-center gap-space-sm">
<span class="bg-status-active-surface text-status-active font-code-sm text-code-sm px-1 py-0.5">#03</span>
<span class="font-code-sm text-code-sm text-text-primary font-semibold">executeSettlement</span>
</div>
<span class="font-label-sm text-label-sm text-text-tertiary flex items-center gap-1">
<span>EXPENSES 64k GAS</span>
<span class="material-symbols-outlined text-[14px]">expand_more</span>
</span>
</button>
<div class="hidden flex-col gap-space-xs pt-space-xs" id="method-body-3">
<div class="font-label-sm text-label-sm text-text-tertiary">
                  Atomic release of locked collateral to the GS operator address following successful RF link verification.
                </div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">bytes32 passId</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none" type="text" value="0x9a8f2190c102bf9214b780ac9d5e30fa8e7d21b456e792c3d0b2f15a9e334510"/>
</div>
<div class="flex items-center justify-between pt-space-xs">
<span class="font-code-sm text-code-sm text-status-nominal">READY // 100% SLA COMPLIANCE MET</span>
<button class="bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-md text-label-md uppercase font-bold px-space-md py-1 flex items-center gap-1 transition-none" onclick="simulateCall('executeSettlement')" type="button">
<span class="material-symbols-outlined text-[14px]">done_all</span>
<span>DISBURSE FUNDS</span>
</button>
</div>
</div>
</div>
<!-- Method 4: slashOperatorBond -->
<div class="bg-surface-inset p-space-sm flex flex-col gap-space-xs">
<button class="w-full flex items-center justify-between text-left hover:text-error transition-none" onclick="toggleMethod('method-body-4')" type="button">
<div class="flex items-center gap-space-sm">
<span class="bg-status-breach-surface text-status-breach font-code-sm text-code-sm px-1 py-0.5">#04</span>
<span class="font-code-sm text-code-sm text-status-breach font-semibold">slashOperatorBond</span>
</div>
<span class="font-label-sm text-label-sm text-text-tertiary flex items-center gap-1">
<span>DISPUTE ARBITRATION</span>
<span class="material-symbols-outlined text-[14px]">expand_more</span>
</span>
</button>
<div class="hidden flex-col gap-space-xs pt-space-xs" id="method-body-4">
<div class="font-label-sm text-label-sm text-text-tertiary">
                  Triggers bonding curve forfeiture when telemetry demonstrates carrier breach or zero downlink packets delivered.
                </div>
<div class="grid grid-cols-3 gap-space-xs">
<div class="col-span-2">
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">bytes32 passId</label>
<input class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none" type="text" value="0x77c191a0b3...510a"/>
</div>
<div>
<label class="font-label-sm text-label-sm text-text-tertiary block mb-0.5">uint8 infraction</label>
<select class="w-full bg-canvas-base px-space-sm py-1 font-code-sm text-code-sm text-text-primary focus:outline-none">
<option value="1">0x01: CARRIER_DROPOUT</option>
<option value="2">0x02: SNR_FLOOR_BREACH</option>
<option value="3">0x03: DISHONORED_KEY_EXCHANGE</option>
</select>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs">
<span class="font-code-sm text-code-sm text-status-breach">REQUIRES MERKLE FRAUD PROOF</span>
<button class="bg-status-breach-surface text-status-breach hover:bg-error hover:text-on-error font-label-md text-label-md uppercase font-bold px-space-md py-1 flex items-center gap-1 transition-none" onclick="simulateCall('slashOperatorBond')" type="button">
<span class="material-symbols-outlined text-[14px]">gavel</span>
<span>SLASH BOND</span>
</button>
</div>
</div>
</div>
</div>
<!-- Live Contract Execution Telemetry Console -->
<div class="mt-space-sm bg-canvas-base p-space-sm">
<div class="flex items-center justify-between pb-space-xs">
<span class="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider flex items-center gap-1">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span>EVM EXECUTION KERNEL OUT</span>
</span>
<span class="font-code-sm text-code-sm text-text-tertiary" id="rpc-latency">RPC: 42ms (Sepolia Infura)</span>
</div>
<div class="font-code-sm text-code-sm text-text-secondary space-y-1 h-32 overflow-y-auto font-mono" id="kernel-console">
<div class="text-text-tertiary">[INIT] Escrow clearinghouse target: 0x7f9a2b8e5c83FaaD018bAcE66A512808c1604B12</div>
<div class="text-text-tertiary">[SYNC] Chainlink Functions Oracle Consumer Router: 0xb83E47D23078804FE777f313fe3a042973797c50</div>
<div class="text-status-nominal">[READY] Local signer connected: 0x4f2a89c1e2f9d8a34b22c710294821a...</div>
<div class="text-text-primary">> Awaiting contract invocation or test query...</div>
</div>
</div>
</div>
</div>
<!-- State Variables Inspector Table -->
<div class="bg-surface-panel flex flex-col">
<div class="h-7 bg-surface-inset px-space-md flex items-center justify-between">
<span class="font-label-md text-label-md text-text-secondary uppercase">ON-CHAIN STATE CONSTANTS & ORACLE REGISTRY</span>
<span class="font-label-sm text-label-sm text-status-nominal flex items-center gap-1">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span>VERIFIED VIEW</span>
</span>
</div>
<div class="p-space-sm overflow-x-auto">
<table class="w-full text-left font-code-sm text-code-sm">
<thead>
<tr class="bg-surface-inset text-text-tertiary text-label-sm font-label-sm">
<th class="py-1 px-space-sm">SLOT / VARIABLE</th>
<th class="py-1 px-space-sm">TYPE</th>
<th class="py-1 px-space-sm text-right">LIVE VALUE</th>
</tr>
</thead>
<tbody class="text-text-secondary divide-y divide-surface-container-highest">
<tr class="hover:bg-surface-inset">
<td class="py-1.5 px-space-sm text-text-primary font-semibold">minAttestationSignatures</td>
<td class="py-1.5 px-space-sm text-text-tertiary">uint8</td>
<td class="py-1.5 px-space-sm text-right font-code-sm text-status-nominal">5 (Quorum 71.4%)</td>
</tr>
<tr class="hover:bg-surface-inset">
<td class="py-1.5 px-space-sm text-text-primary font-semibold">donSubId</td>
<td class="py-1.5 px-space-sm text-text-tertiary">uint64</td>
<td class="py-1.5 px-space-sm text-right font-code-sm text-hash-spectral">2901 (Active)</td>
</tr>
<tr class="hover:bg-surface-inset">
<td class="py-1.5 px-space-sm text-text-primary font-semibold">disputeWindowAOS_Buffer</td>
<td class="py-1.5 px-space-sm text-text-tertiary">uint32</td>
<td class="py-1.5 px-space-sm text-right font-code-sm text-text-primary">1800 sec (30 min)</td>
</tr>
<tr class="hover:bg-surface-inset">
<td class="py-1.5 px-space-sm text-text-primary font-semibold">usdcTokenAddress</td>
<td class="py-1.5 px-space-sm text-text-tertiary">address</td>
<td class="py-1.5 px-space-sm text-right font-code-sm text-primary">0x1c7D4B...33E2</td>
</tr>
<tr class="hover:bg-surface-inset">
<td class="py-1.5 px-space-sm text-text-primary font-semibold">protocolTreasuryFeeBPS</td>
<td class="py-1.5 px-space-sm text-text-tertiary">uint16</td>
<td class="py-1.5 px-space-sm text-right font-code-sm text-text-primary">25 bps (0.25%)</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<!-- RIGHT COLUMN: Chainlink Functions JS, Agent SDKs, Event Listeners & cURL (7 Cols) -->
<div class="xl:col-span-7 flex flex-col gap-gutter">
<!-- Code Execution Interactive Workspace -->
<div class="bg-surface-panel flex flex-col">
<!-- Interactive Code Tabs Bar -->
<div class="bg-surface-inset flex items-center justify-between flex-wrap">
<div class="flex items-center" id="code-tabs">
<button class="code-tab-btn px-space-md h-8 flex items-center gap-space-xs font-label-md text-label-md bg-surface-panel text-primary font-semibold border-b-2 border-primary transition-none" onclick="switchCodeTab('tab-functions', this)" type="button">
<span class="material-symbols-outlined text-[14px]">code</span>
<span>CHAINLINK FUNCTION JS</span>
</button>
<button class="code-tab-btn px-space-md h-8 flex items-center gap-space-xs font-label-md text-label-md text-text-secondary hover:text-text-primary hover:bg-surface-panel transition-none" onclick="switchCodeTab('tab-python', this)" type="button">
<span class="material-symbols-outlined text-[14px]">smart_toy</span>
<span>PYTHON AGENT SDK</span>
</button>
<button class="code-tab-btn px-space-md h-8 flex items-center gap-space-xs font-label-md text-label-md text-text-secondary hover:text-text-primary hover:bg-surface-panel transition-none" onclick="switchCodeTab('tab-curl', this)" type="button">
<span class="material-symbols-outlined text-[14px]">terminal</span>
<span>CURL / REST API</span>
</button>
<button class="code-tab-btn px-space-md h-8 flex items-center gap-space-xs font-label-md text-label-md text-text-secondary hover:text-text-primary hover:bg-surface-panel transition-none" onclick="switchCodeTab('tab-events', this)" type="button">
<span class="material-symbols-outlined text-[14px]">radio</span>
<span>WEB3.PY ESCROW LISTENER</span>
</button>
</div>
<div class="px-space-sm py-1 flex items-center gap-space-xs">
<button class="bg-surface-panel hover:bg-surface-bright text-text-primary font-label-sm text-label-sm px-space-sm py-0.5 flex items-center gap-1" onclick="copyCodePayload()" type="button">
<span class="material-symbols-outlined text-[12px]">content_copy</span>
<span id="copy-btn-label">COPY RAW</span>
</button>
</div>
</div>
<!-- Code Block Panels Container -->
<div class="p-space-md bg-canvas-base">
<!-- TAB 1: CHAINLINK FUNCTION JAVASCRIPT -->
<div class="code-view flex flex-col gap-space-sm" id="tab-functions">
<div class="flex items-center justify-between pb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">
                SOURCE: <span class="text-text-secondary font-code-sm">oracle/chainlink/satnogs_telemetry_verifier.js</span>
</span>
<span class="font-label-sm text-label-sm text-hash-spectral">CHAINLINK DON JAVASCRIPT RUNTIME v1.2</span>
</div>
<pre class="font-code-sm text-code-sm text-text-secondary overflow-x-auto leading-relaxed p-space-sm bg-surface-panel font-mono select-text"><code id="code-snippet-functions"><span class="text-text-tertiary">// DSRM Decentralized Oracle Network // Chainlink Functions Telemetry Verifier
// Arguments: args[0] = noradId (e.g. "25544"), args[1] = passId, args[2] = minSNR ("12.5")</span>
<span class="text-hash-spectral">const</span> noradId = args[<span class="text-primary">0</span>];
<span class="text-hash-spectral">const</span> passId = args[<span class="text-primary">1</span>];
<span class="text-hash-spectral">const</span> requiredSnr = parseFloat(args[<span class="text-primary">2</span>]);

<span class="text-text-tertiary">// 1. Query SatNOGS Network API for verified observation passes</span>
<span class="text-hash-spectral">const</span> satnogsResponse = <span class="text-hash-spectral">await</span> Functions.makeHttpRequest({
  url: <span class="text-secondary">\`https://network.satnogs.org/api/observations/?satellite__norad_cat_id=\${noradId}&vetted_status=good\`</span>,
  headers: { <span class="text-primary">"Content-Type"</span>: <span class="text-secondary">"application/json"</span> },
  timeout: <span class="text-status-pending">8500</span>
});

<span class="text-hash-spectral">if</span> (satnogsResponse.error || !satnogsResponse.data || satnogsResponse.data.length === <span class="text-primary">0</span>) {
  <span class="text-hash-spectral">throw</span> <span class="text-status-breach">Error</span>(<span class="text-status-breach">\`SatNOGS Oracle Ingest Fault: No verified observations found\`</span>);
}

<span class="text-hash-spectral">const</span> latestObs = satnogsResponse.data[<span class="text-primary">0</span>];
<span class="text-hash-spectral">const</span> telemetryObsId = latestObs.id;
<span class="text-hash-spectral">const</span> clientSnr = latestObs.waterfall ? parseFloat(latestObs.client_snr || <span class="text-secondary">"14.8"</span>) : <span class="text-primary">0</span>;
<span class="text-hash-spectral">const</span> packetCount = latestObs.demoddata ? latestObs.demoddata.length : <span class="text-primary">48</span>;

<span class="text-text-tertiary">// 2. Audit SLA thresholds: SNR > requiredSnr & minimum packets >= 12</span>
<span class="text-hash-spectral">const</span> passValid = (clientSnr >= requiredSnr) && (packetCount >= <span class="text-primary">12</span>);
<span class="text-hash-spectral">const</span> snrBasisPoints = Math.round(clientSnr * <span class="text-primary">100</span>); <span class="text-text-tertiary">// e.g. 1480 bps</span>

<span class="text-text-tertiary">// 3. Pack parameters for on-chain EscrowClearinghouse consumption</span>
<span class="text-hash-spectral">const</span> encodedPayload = ethers.AbiCoder.defaultAbiCoder().encode(
  [<span class="text-secondary">'bytes32'</span>, <span class="text-secondary">'uint256'</span>, <span class="text-secondary">'uint256'</span>, <span class="text-secondary">'bool'</span>],
  [passId, telemetryObsId, snrBasisPoints, passValid]
);

<span class="text-hash-spectral">return</span> Functions.encodeString(encodedPayload);</code></pre>
</div>
<!-- TAB 2: PYTHON AGENT SDK -->
<div class="code-view hidden flex-col gap-space-sm" id="tab-python">
<div class="flex items-center justify-between pb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">
                TARGET: <span class="text-text-secondary font-code-sm">dsrm-sdk-py // Autonomous Arbitrage & Pass Booker</span>
</span>
<span class="font-label-sm text-label-sm text-secondary">PYTHON 3.11+ / ASYNCIO</span>
</div>
<pre class="font-code-sm text-code-sm text-text-secondary overflow-x-auto leading-relaxed p-space-sm bg-surface-panel font-mono select-text"><code id="code-snippet-python"><span class="text-hash-spectral">from</span> dsrm <span class="text-hash-spectral">import</span> DSRMClient, OrbitalPassOrder
<span class="text-hash-spectral">from</span> web3 <span class="text-hash-spectral">import</span> Web3
<span class="text-hash-spectral">import</span> asyncio

<span class="text-hash-spectral">async def</span> <span class="text-primary">auto_reserve_orbital_slot</span>(norad_id: <span class="text-hash-spectral">int</span>, max_price_usdc: <span class="text-hash-spectral">float</span>):
    client = DSRMClient(
        private_key=<span class="text-secondary">"0x4f2a...9c1e"</span>,
        network=<span class="text-secondary">"sepolia"</span>,
        rpc_url=<span class="text-secondary">"https://sepolia.infura.io/v3/\${INFURA_KEY}"</span>
    )
    
    <span class="text-text-tertiary"># 1. Query agent pass clearinghouse for open ground station passes</span>
    open_passes = <span class="text-hash-spectral">await</span> client.market.find_passes(
        norad_id=norad_id,
        min_elevation_deg=<span class="text-primary">25.0</span>,
        frequency_band=<span class="text-secondary">"X-BAND"</span>
    )
    
    target = next((p <span class="text-hash-spectral">for</span> p <span class="text-hash-spectral">in</span> open_passes <span class="text-hash-spectral">if</span> p.price_usdc <= max_price_usdc), None)
    <span class="text-hash-spectral">if not</span> target:
        <span class="text-hash-spectral">return</span> <span class="text-status-pending">"No matching orbital pass under budget threshold."</span>

    <span class="text-text-tertiary"># 2. Lock USDC in DSRMEscrowClearinghouse</span>
    tx_hash = <span class="text-hash-spectral">await</span> client.escrow.create_escrow_window(
        norad_id=target.norad_id,
        aos=target.aos_epoch,
        los=target.los_epoch,
        amount_usdc=target.price_usdc,
        operator_address=target.operator_wallet
    )
    <span class="text-hash-spectral">return</span> <span class="text-secondary">f"Locked pass {target.pass_id} tx: {tx_hash}"</span>

asyncio.run(auto_reserve_orbital_slot(<span class="text-primary">25544</span>, <span class="text-primary">450.00</span>))</code></pre>
</div>
<!-- TAB 3: CURL / REST API -->
<div class="code-view hidden flex-col gap-space-sm" id="tab-curl">
<div class="flex items-center justify-between pb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">
                ENDPOINT: <span class="text-text-secondary font-code-sm">POST /v2/agent/escrow/order-lock</span>
</span>
<span class="font-label-sm text-label-sm text-primary">mTLS / ED25519 SIGNED REQUEST</span>
</div>
<pre class="font-code-sm text-code-sm text-text-secondary overflow-x-auto leading-relaxed p-space-sm bg-surface-panel font-mono select-text"><code id="code-snippet-curl"><span class="text-text-tertiary"># 1. Query available passes bounded by Lat/Long coordinates and Elevation</span>
curl -X GET <span class="text-secondary">"https://api.dsrm.orbital.clearing/v2/passes?bbox=40.71,-74.00,42.36,-71.05&min_elevation=30&norad=25544"</span> \
  -H <span class="text-primary">"Authorization: Bearer dsrm_live_9f81ac3091bb"</span> \
  -H <span class="text-primary">"Accept: application/json"</span>

<span class="text-text-tertiary"># 2. Programmatically lock escrow window via Autonomous Agent endpoint</span>
curl -X POST <span class="text-secondary">"https://api.dsrm.orbital.clearing/v2/agent/escrow/order-lock"</span> \
  -H <span class="text-primary">"Content-Type: application/json"</span> \
  -H <span class="text-primary">"X-DSRM-Signature: 0x9f1a23b...8e11a"</span> \
  -d <span class="text-text-primary">'{
    "noradId": 25544,
    "aosTimestamp": 1744483329,
    "losTimestamp": 1744483989,
    "allocatedBandwidthMhz": 40.0,
    "maxSettlementPriceUSDC": 350.00,
    "agentCallbackUrl": "https://agent.autonomous.firm/callbacks/orbital"
  }'</span></code></pre>
</div>
<!-- TAB 4: WEB3.PY ESCROW EVENT LISTENER -->
<div class="code-view hidden flex-col gap-space-sm" id="tab-events">
<div class="flex items-center justify-between pb-space-xs">
<span class="font-label-sm text-label-sm text-text-tertiary">
                STREAM: <span class="text-text-secondary font-code-sm">DSRMEscrowClearinghouse.events.*</span>
</span>
<span class="font-label-sm text-label-sm text-status-nominal">WSS:// ETHEREUM SEPOLIA</span>
</div>
<pre class="font-code-sm text-code-sm text-text-secondary overflow-x-auto leading-relaxed p-space-sm bg-surface-panel font-mono select-text"><code id="code-snippet-events"><span class="text-hash-spectral">from</span> web3 <span class="text-hash-spectral">import</span> Web3
<span class="text-hash-spectral">from</span> eth_abi <span class="text-hash-spectral">import</span> decode

w3 = Web3(Web3.LegacyWebSocketProvider(<span class="text-secondary">"wss://sepolia.infura.io/ws/v3/\${INFURA_KEY}"</span>))
contract_addr = <span class="text-secondary">"0x7f9a2b8e5c83FaaD018bAcE66A512808c1604B12"</span>

<span class="text-hash-spectral">async def</span> <span class="text-primary">track_escrow_events</span>():
    event_filter = w3.eth.filter({
        <span class="text-secondary">"address"</span>: contract_addr,
        <span class="text-secondary">"topics"</span>: [w3.keccak(text=<span class="text-secondary">"EscrowSettled(bytes32,address,uint256,uint256)"</span>).hex()]
    })
    
    <span class="text-hash-spectral">while True</span>:
        <span class="text-hash-spectral">for</span> log <span class="text-hash-spectral">in</span> event_filter.get_new_entries():
            pass_id = log[<span class="text-secondary">'topics'</span>][<span class="text-primary">1</span>].hex()
            operator, amount, timestamp = decode([<span class="text-secondary">'address'</span>, <span class="text-secondary">'uint256'</span>, <span class="text-secondary">'uint256'</span>], log[<span class="text-secondary">'data'</span>])
            print(<span class="text-secondary">f"[SETTLED] Pass: {pass_id} Disbursed: {amount / 1e6} USDC to {operator}"</span>)

<span class="text-text-tertiary"># Instantiates automated zero-latency ledger reconciliation</span></code></pre>
</div>
</div>
</div>
<!-- Live Chainlink DON Consensual Status Grid -->
<div class="bg-surface-panel flex flex-col">
<div class="h-7 bg-surface-inset px-space-md flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-hash-spectral text-[14px]">hub</span>
<span class="font-label-md text-label-md text-text-secondary uppercase">CHAINLINK DON QUORUM MATRIX // 7 NODES ONLINE</span>
</div>
<span class="font-label-sm text-label-sm text-text-tertiary">THRESHOLD: 5/7 SIGNATURES REQUIRED</span>
</div>
<div class="p-space-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-xs">
<div class="bg-surface-inset p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span class="font-code-sm text-code-sm text-text-primary">DON-NODE-01</span>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-text-tertiary block">LATENCY</span>
<span class="font-code-sm text-code-sm text-status-nominal">18ms</span>
</div>
</div>
<div class="bg-surface-inset p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span class="font-code-sm text-code-sm text-text-primary">DON-NODE-02</span>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-text-tertiary block">LATENCY</span>
<span class="font-code-sm text-code-sm text-status-nominal">24ms</span>
</div>
</div>
<div class="bg-surface-inset p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span class="font-code-sm text-code-sm text-text-primary">DON-NODE-03</span>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-text-tertiary block">LATENCY</span>
<span class="font-code-sm text-code-sm text-status-nominal">31ms</span>
</div>
</div>
<div class="bg-surface-inset p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span class="font-code-sm text-code-sm text-text-primary">DON-NODE-04</span>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-text-tertiary block">LATENCY</span>
<span class="font-code-sm text-code-sm text-status-nominal">21ms</span>
</div>
</div>
<div class="bg-surface-inset p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span class="font-code-sm text-code-sm text-text-primary">DON-NODE-05</span>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-text-tertiary block">LATENCY</span>
<span class="font-code-sm text-code-sm text-status-nominal">29ms</span>
</div>
</div>
<div class="bg-surface-inset p-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="h-1.5 w-1.5 bg-status-nominal"></span>
<span class="font-code-sm text-code-sm text-text-primary">DON-NODE-06</span>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-text-tertiary block">LATENCY</span>
<span class="font-code-sm text-code-sm text-status-nominal">38ms</span>
</div>
</div>
</div>
<div class="bg-surface-inset px-space-sm py-1 flex items-center justify-between">
<span class="font-label-sm text-label-sm text-text-tertiary">LATEST OCR2 ROUND: #89,102</span>
<span class="font-code-sm text-code-sm text-hash-spectral">LEADER: 0x981...ef01</span>
<span class="font-label-sm text-label-sm text-text-secondary">CONSENSUS STATE: 100% HEALTHY</span>
</div>
</div>
</div>
</div>
</div>
<script>
  function switchCodeTab(tabId, el) {
    document.querySelectorAll('.code-view').forEach(view => {
      view.classList.add('hidden');
      view.classList.remove('flex');
    });
    
    const activeView = document.getElementById(tabId);
    if (activeView) {
      activeView.classList.remove('hidden');
      activeView.classList.add('flex');
    }

    document.querySelectorAll('.code-tab-btn').forEach(btn => {
      btn.classList.remove('bg-surface-panel', 'text-primary', 'font-semibold', 'border-b-2', 'border-primary');
      btn.classList.add('text-text-secondary');
    });

    el.classList.remove('text-text-secondary');
    el.classList.add('bg-surface-panel', 'text-primary', 'font-semibold', 'border-b-2', 'border-primary');
  }

  function toggleMethod(bodyId) {
    const target = document.getElementById(bodyId);
    if (target) {
      if (target.classList.contains('hidden')) {
        target.classList.remove('hidden');
        target.classList.add('flex');
      } else {
        target.classList.add('hidden');
        target.classList.remove('flex');
      }
    }
  }

  function simulateCall(methodName) {
    const consoleEl = document.getElementById('kernel-console');
    const timestamp = new Date().toISOString().substring(11, 23);
    const txHash = '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const entry = document.createElement('div');
    entry.className = 'text-primary';
    entry.textContent = \`[\${timestamp}] TX BROADCAST -> \${methodName}()\`;
    consoleEl.appendChild(entry);

    const miningEntry = document.createElement('div');
    miningEntry.className = 'text-text-tertiary';
    miningEntry.textContent = \`  -> Pending tx: \${txHash.substring(0, 18)}... (gasPrice: 14.1 Gwei)\`;
    consoleEl.appendChild(miningEntry);

    setTimeout(() => {
      const confirmEntry = document.createElement('div');
      confirmEntry.className = 'text-status-nominal';
      confirmEntry.textContent = \`  -> CONFIRMED in Block #6892105 (Receipt Status: 0x1 SUCCESS)\`;
      consoleEl.appendChild(confirmEntry);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }, 600);

    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  function copyCodePayload() {
    const activeCodeView = document.querySelector('.code-view:not(.hidden) code');
    if (activeCodeView) {
      navigator.clipboard.writeText(activeCodeView.innerText).then(() => {
        const lbl = document.getElementById('copy-btn-label');
        const prev = lbl.textContent;
        lbl.textContent = 'COPIED!';
        setTimeout(() => { lbl.textContent = prev; }, 1500);
      });
    }
  }
</script></main>` }} 
    />
  );
}
