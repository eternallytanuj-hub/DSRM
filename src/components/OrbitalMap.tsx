'use client';
import { useEffect, useRef } from 'react';

export default function OrbitalMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.innerHTML.trim() !== '') return;
    
    // Render HTML
    containerRef.current.innerHTML = `
  <div id="map"></div>

  <div class="intro-overlay" id="intro">
    <div class="intro__content">
      <img class="intro__logo" src="./DSRM_logo.png" alt="DSRM">
      <p class="intro__desc">Real-time satellite tracking.</p>
      <button class="intro__start" id="intro-start" type="button">Enter</button>
    </div>
  </div>

  <!-- Instructions overlay (centered) -->
  <div class="instructions" id="instructions" hidden>
    <p>Scroll to zoom</p>
    <p>Left click + drag to spin</p>
    <p>Right click + drag to rotate</p>
  </div>

  <!-- Location panel (top-left) -->
  <header class="location-panel">
    <span class="location-panel__date"></span>
    <span class="location-panel__time"></span>
    <span class="location-panel__location">
      <span class="location-panel__city">Earth</span>
      <span class="location-panel__country"></span>
    </span>
    <span class="location-panel__lat">--</span>
    <span class="location-panel__lng">--</span>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-block-start: var(--space-4);">
      <a class="location-panel__about" id="about-btn" href="#about" role="button" style="margin-block-start: 0;">About this project <span class="location-panel__about-arrow" aria-hidden="true">&rarr;</span></a>
      <a class="location-panel__about" id="marketplace-btn" href="/marketplace" style="margin-block-start: 0;">1. Marketplace <span class="location-panel__about-arrow" aria-hidden="true">&rarr;</span></a>
      <a class="location-panel__about" id="escrow-btn" href="/escrow-clearing" style="margin-block-start: 0;">2. Escrow & Wallet <span class="location-panel__about-arrow" aria-hidden="true">&rarr;</span></a>
      <a class="location-panel__about" id="telemetry-btn" href="/telemetry-oracle" style="margin-block-start: 0;">3. Telemetry Oracle <span class="location-panel__about-arrow" aria-hidden="true">&rarr;</span></a>
      <a class="location-panel__about" id="agent-btn" href="/api-smart-contract" style="margin-block-start: 0;">4. Agent API / Docs <span class="location-panel__about-arrow" aria-hidden="true">&rarr;</span></a>
    </div>
  </header>

  <!-- Control strip (middle-right) -->
  <aside class="control-strip" id="control-strip">
    <nav class="control-strip__filters" id="cat-filters" aria-label="Satellite category filters">
      <button class="cat-btn is-active" type="button" data-cat="all">
        <span class="cat-btn__label">All</span>
        <span class="cat-btn__count" data-count="all">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="starlink">
        <span class="cat-btn__label">Starlink</span>
        <span class="cat-btn__count" data-count="starlink">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="oneweb">
        <span class="cat-btn__label">OneWeb</span>
        <span class="cat-btn__count" data-count="oneweb">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="gps">
        <span class="cat-btn__label">GPS</span>
        <span class="cat-btn__count" data-count="gps">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="glonass">
        <span class="cat-btn__label">GLONASS</span>
        <span class="cat-btn__count" data-count="glonass">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="galileo">
        <span class="cat-btn__label">Galileo</span>
        <span class="cat-btn__count" data-count="galileo">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="iridium">
        <span class="cat-btn__label">Iridium</span>
        <span class="cat-btn__count" data-count="iridium">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="weather">
        <span class="cat-btn__label">Weather</span>
        <span class="cat-btn__count" data-count="weather">--</span>
      </button>
      <button class="cat-btn" type="button" data-cat="earth">
        <span class="cat-btn__label">Earth Obs</span>
        <span class="cat-btn__count" data-count="earth">--</span>
      </button>
    </nav>
    <div class="control-strip__fps" id="fps">-- fps</div>
  </aside>

  <!-- About modal -->
  <div class="about-modal" id="about-modal" role="dialog" aria-labelledby="about-title" aria-modal="true" hidden>
    <div class="about-modal__backdrop" data-close></div>
    <div class="about-modal__panel">
      <h2 class="about-modal__title" id="about-title">About DSRM</h2>
      
<div class="about-modal__body" id="about-body" style="text-align: left; overflow-y: auto; max-height: 60vh; padding-right: 15px;">
  <style>
    .about-modal__body h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #fff; }
    .about-modal__body h4 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #fff; }
    .about-modal__body p { margin-bottom: 1rem; line-height: 1.5; color: #ccc; }
    .about-modal__body strong { color: #fff; }
    .about-modal__body hr { border: 0; border-top: 1px solid #333; margin: 1.5rem 0; }
    .about-modal__body ul { margin-left: 1.5rem; margin-bottom: 1rem; color: #ccc; }
    .about-modal__body li { margin-bottom: 0.5rem; line-height: 1.5; }
    .problem-strip { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 1rem; }
    .problem-item { flex: 1; min-width: 200px; color: #ccc; line-height: 1.5; }
  </style>

  <h3>The Satellite Marketplace That Runs Itself</h3>
  <p><strong>Satellites orbit overhead every minute with unused bandwidth, idle compute, and empty observation windows. We built the infrastructure to turn that waste into an open, programmable market — no brokers, no contracts, no waiting.</strong></p>
  <p>Book a connectivity window in seconds. Pay only when the satellite delivers.</p>
  
  <hr>
  <h4>The Problem Strip</h4>
  <div class="problem-strip">
    <div class="problem-item">
      <strong>\$300B Industry. 40% Wasted.</strong><br>
      Every day, satellites pass over regions with nobody booked on them. That capacity expires forever.
    </div>
    <div class="problem-item">
      <strong>Weeks to Book. Seconds to Need.</strong><br>
      Traditional satellite access requires legal teams and months of negotiation. The world moves faster than that.
    </div>
    <div class="problem-item">
      <strong>No Proof. No Trust.</strong><br>
      When a satellite says it delivered your service, you have to take their word for it. Until now.
    </div>
  </div>
  
  <hr>
  <h4>What We Built</h4>
  <p><strong>The first decentralized marketplace for satellite resources.</strong></p>
  <p>Operators list their idle orbital windows. Researchers, startups, and autonomous AI agents book them instantly — paying only when verifiable proof of delivery is recorded on the blockchain.</p>
  <p>No intermediaries sitting between the satellite and the buyer. No centralized clearing house taking a cut. No manual legal agreements. Just a smart contract that holds the payment, waits for the satellite to do its job, and releases funds automatically when the work is confirmed.</p>
  
  <hr>
  <h4>How It Works</h4>
  <p><strong>Step 1 — Operators List</strong><br>Satellite operators upload their upcoming idle windows — unused bandwidth, observation passes, or compute time — with pricing set dynamically based on demand and orbital position.</p>
  <p><strong>Step 2 — Buyers Book</strong><br>Users connect a Web3 wallet, browse real-time satellite availability across orbital paths, and book a window instantly. Payment is locked in a smart contract escrow — not with the operator, not with us.</p>
  <p><strong>Step 3 — The Satellite Delivers</strong><br>The connectivity window opens. Ground stations monitor the session and log performance metrics — uplink quality, throughput, session integrity — continuously throughout the window.</p>
  <p><strong>Step 4 — Proof Triggers Payment</strong><br>That telemetry is cryptographically verified and written to the blockchain as an immutable proof of delivery. The smart contract reads this proof and automatically releases payment to the operator. If delivery failed, the buyer gets refunded. No dispute calls. No waiting. No arguing.</p>
  
  <hr>
  <h4>Who This Is For</h4>
  <p><strong>Independent Researchers</strong><br>Access Earth observation passes or data relay windows without institutional contracts or minimum commitments. Pay for exactly what you use.</p>
  <p><strong>Startups and Edge Developers</strong><br>Build applications that depend on satellite connectivity without negotiating enterprise agreements. Book micro-windows programmatically through our API.</p>
  <p><strong>Autonomous AI Agents</strong><br>The marketplace is fully API-accessible. Agents can evaluate availability, check pricing against budget parameters, and execute bookings without human involvement at any step.</p>
  <p><strong>Satellite Operators</strong><br>Stop letting idle windows expire as dead revenue. List your upcoming unused capacity and earn from assets that were already going to orbit anyway.</p>
  
  <hr>
  <h4>Why Blockchain — The Short Answer</h4>
  <p>Three reasons that actually matter:</p>
  <p><strong>Escrow without a middleman.</strong> Your payment sits in code, not in someone's bank account. It moves only when the conditions are met.</p>
  <p><strong>Proof that cannot be edited.</strong> Once telemetry is written to the blockchain, nobody — not the operator, not us — can alter the record of what the satellite actually delivered.</p>
  <p><strong>Programmable agreements.</strong> The terms of every booking are encoded in a smart contract. Partial delivery triggers proportional payment. Cancellations trigger automatic refunds. No phone calls required.</p>
  
  <hr>
  <h4>The Numbers That Matter</h4>
  <ul>
    <li>Satellites spend an estimated <strong>40 to 70 percent</strong> of their capacity unutilized on any given day</li>
    <li>Traditional satellite booking takes <strong>weeks to months</strong> from first contact to active service</li>
    <li>The commercial satellite market is worth over <strong>\$300 billion annually</strong> — most of it inaccessible to small buyers</li>
    <li>A smart contract escrow releases funds in <strong>seconds</strong> after proof of delivery is confirmed</li>
  </ul>
  
  <hr>
  <h4>What Makes This Different</h4>
  <p>Most satellite service companies sell access. We sell a protocol.</p>
  <p>The difference is significant. A service company is the intermediary — you trust them to deliver, trust them to handle your payment, and trust their records of what happened. If they fail at any of those, you are in a legal dispute.</p>
  <p>This platform removes itself from that chain. The smart contract is the escrow. The oracle network is the auditor. The blockchain is the record. We built the rails. The transactions run on them without us in the middle.</p>
  
  <hr>
  <h4>Built For The Way Space Is Moving</h4>
  <p>The satellite industry is changing fast. Launch costs have dropped by over 90% in a decade. Thousands of smallsats are entering orbit. New Space companies are building constellations faster than the old procurement models can handle.</p>
  <p>The infrastructure to access and pay for these assets has not kept pace. We are building that infrastructure — open, automated, and designed from the ground up for a world where satellites are abundant and buyers are diverse.</p>
  
  <hr>
  <h4>What is this exactly?</h4>
  <p>A decentralized marketplace where satellite operators list idle orbital capacity and buyers book it instantly using blockchain-based smart contracts. Payment is held in escrow and released automatically when on-chain telemetry confirms delivery. No brokers. No manual agreements. No centralized clearinghouse.</p>
</div>

      <button class="about-modal__close" id="about-close" type="button" aria-label="Close"></button>
    </div>
  </div>

  <!-- Bottom-center sliders (desktop) -->
  <div class="bottom-sliders">
    <div class="playback-controls">
      <button class="playback-btn" id="play-pause" type="button" aria-label="Pause simulation">
        <svg class="playback-btn__pause" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor"/>
          <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor"/>
        </svg>
        <svg class="playback-btn__play" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" hidden>
          <path d="M3 1.5v11l9-5.5z" fill="currentColor"/>
        </svg>
      </button>
      <button class="playback-btn" id="reset-time" type="button" aria-label="Reset to real-time positions">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 2.5v4h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.5 8.5a4.5 4.5 0 1 0 1-3.2L2.5 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="bottom-slider">
      <label class="bottom-slider__label" for="speed-slider">Speed</label>
      <span class="bottom-slider__val" id="speed-val">100x</span>
      <input type="range" id="speed-slider" min="0" max="100" step="1" value="37">
    </div>
    <div class="bottom-slider">
      <label class="bottom-slider__label" for="trail-slider">Trail</label>
      <span class="bottom-slider__val" id="trail-val">300s</span>
      <input type="range" id="trail-slider" min="0" max="2000" step="50" value="300">
    </div>
  </div>

  <!-- Time of day controls -->
  <nav class="time-controls" id="time-controls" aria-label="Time of day">
    <button class="time-btn" type="button" data-phase="0.0" aria-label="Night">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M13.5 10.5a5.5 5.5 0 01-7-7 6 6 0 107 7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="time-btn__label">Night</span>
    </button>
    <button class="time-btn" type="button" data-phase="0.30" aria-label="Dawn">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 3v2M3.93 5.34l1.41 1.41M12.66 6.75l1.41-1.41M4 12h10M2 15h14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M5.5 12a3.5 3.5 0 017 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <span class="time-btn__label">Dawn</span>
    </button>
    <button class="time-btn" type="button" data-phase="0.50" aria-label="Day">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="3.5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.42 1.42M12.36 12.36l1.42 1.42M4.22 13.78l1.42-1.42M12.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <span class="time-btn__label">Day</span>
    </button>
    <button class="time-btn" type="button" data-phase="0.70" aria-label="Dusk">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 5v-2M3.93 6.75l-1.41-1.41M14.07 6.75l1.41-1.41M4 12h10M2 15h14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M5.5 12a3.5 3.5 0 017 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <span class="time-btn__label">Dusk</span>
    </button>
  </nav>

  <!-- Mobile drawer -->
  <button class="drawer-toggle" id="drawer-toggle" type="button" aria-expanded="false" aria-controls="mobile-drawer" aria-label="Toggle controls">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 8l4-3 4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 13l4 3 4-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="mobile-drawer" id="mobile-drawer"></div>

  
  <!-- Marketplace modal -->
  <div class="about-modal" id="marketplace-modal" role="dialog" aria-modal="true" hidden>
    <div class="about-modal__backdrop" data-close-marketplace></div>
    <div class="about-modal__panel" style="max-width: 1260px; width: 95%; max-height: 92vh; padding: 0; overflow: hidden; overflow-y: auto; background: rgba(10, 10, 18, 0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; box-shadow: none;">
      
      <style>
        .mkt-stage {
          color: #d8d8de;
          font-family: 'Geist', system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          position: relative;
        }
        .mkt-stage * { box-sizing: border-box; }
        
        .mkt-marquee {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          height: 32px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .mkt-marquee-track {
          display: flex;
          gap: 38px;
          white-space: nowrap;
          animation: mktScrollLeft 28s linear infinite;
          font-family: var(--font-mono, "SF Mono", "Menlo", monospace);
          font-size: 11px;
          color: #909097;
        }
        .mkt-marquee-track span { color: #5b8def; }
        .mkt-marquee-track b { color: #fff; font-weight: 600; }
        @keyframes mktScrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .mkt-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mkt-brand { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 14px; font-weight: 600; color: #fff; }
        .mkt-brand img { height: 18px; }
        .mkt-brand small { color: #909097; font-weight: 400; }

        .mkt-tabs { display: flex; height: 100%; }
        .app-tab {
          display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
          padding: 0 18px;
          border-left: 1px solid rgba(255,255,255,0.04);
          position: relative;
          min-width: 108px;
          cursor: pointer;
        }
        .app-tab:last-child { border-right: 1px solid rgba(255,255,255,0.04); }
        .app-tab .name { font-size: 12px; letter-spacing: 0.06em; color: #909097; transition: color 0.2s; }
        .app-tab .live { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
        .app-tab .live .d { width: 5px; height: 5px; background: #5b8def; border-radius: 50%; opacity: 0.5; }
        .app-tab .live span { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 9.5px; color: #666; }
        .app-tab:hover .name { color: #d8d8de; }
        .app-tab.active .name { color: #fff; font-weight: 600; }
        .app-tab.active::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
          background: #5b8def;
        }

        .mkt-wallet { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 12px; color: #909097; }
        .mkt-wallet .dot { width: 6px; height: 6px; background: #4ecb71; border-radius: 50%; }
        .mkt-wallet .addr { color: #fff; }
        .mkt-wallet .net { padding: 3px 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #909097; font-size: 10px; letter-spacing: 0.05em; }

        .mkt-ask-zone { padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .mkt-ask-label { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 11px; letter-spacing: 0.12em; color: #909097; margin-bottom: 8px; }

        .mkt-ask-bar {
          display: flex; align-items: center; gap: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          padding: 10px 16px;
        }
        .mkt-ask-bar .query { flex: 1; font-size: 15px; font-weight: 400; color: #fff; }
        .mkt-ask-bar .cursor { display: inline-block; width: 2px; height: 16px; background: #5b8def; vertical-align: -3px; margin-left: 2px; animation: mktBlink 1s steps(1) infinite; }
        @keyframes mktBlink { 50% { opacity: 0; } }
        .mkt-ask-bar .run {
          font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 11.5px; letter-spacing: 0.06em; font-weight: 600;
          color: #fff; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
          padding: 8px 14px; white-space: nowrap; cursor: pointer;
        }

        .mkt-filters {
          display: grid;
          grid-template-columns: 1fr 1.3fr 1.3fr 0.9fr 0.9fr;
          gap: 1px;
          margin-top: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          overflow: hidden;
        }
        .mkt-filter { padding: 10px 14px; background: rgba(10, 10, 18, 0.9); }
        .mkt-filter .fl {
          font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 9.5px; letter-spacing: 0.1em; color: #909097;
          display: flex; justify-content: space-between; margin-bottom: 8px;
        }
        .mkt-filter .fl .val { color: #5b8def; font-weight: 600; }
        .mkt-filter select {
          width: 100%; background: transparent; border: none; color: #d8d8de;
          font-family: inherit; font-size: 13px; outline: none; appearance: none; cursor: pointer;
        }
        .mkt-filter select option { background: #111; }
        
        .mkt-filter input[type=range] { width: 100%; height: 2px; background: rgba(255,255,255,0.1); appearance: none; outline: none; margin: 0; }
        .mkt-filter input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 10px; height: 10px; background: #5b8def; border-radius: 50%; cursor: pointer;
        }

        .mkt-body-grid { display: grid; grid-template-columns: 280px 1fr 240px; flex: 1; }
        .mkt-col { padding: 20px 24px; }
        .mkt-col-left { border-right: 1px solid rgba(255,255,255,0.06); }
        .mkt-col-right { border-left: 1px solid rgba(255,255,255,0.06); }
        .mkt-section-title { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 11px; letter-spacing: 0.12em; color: #909097; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .mkt-section-title .d { width: 5px; height: 5px; background: #fff; opacity: 0.3; border-radius: 50%; }

        .mkt-req-row { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .mkt-req-key { font-size: 13px; color: #909097; }
        .mkt-req-val { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 12px; color: #d8d8de; font-weight: 500; }

        .mkt-scan-box {
          margin-top: 18px; padding: 12px; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
          background: rgba(255,255,255,0.02); font-size: 12px; color: #909097; line-height: 1.5;
        }
        .mkt-scan-box b { color: #fff; }

        .mkt-cand-head { display: grid; grid-template-columns: 24px 1.6fr 1fr 0.8fr 0.8fr 0.8fr; gap: 10px; padding: 0 12px 10px; font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 10px; letter-spacing: 0.08em; color: #666; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .mkt-cand-row { display: grid; grid-template-columns: 24px 1.6fr 1fr 0.8fr 0.8fr 0.8fr; gap: 10px; align-items: center; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); border-radius: 6px; margin: 4px 0; }
        .mkt-cand-row.selected { background: rgba(91,141,239,0.08); border: 1px solid rgba(91,141,239,0.2); }
        .mkt-rank-num { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 11px; color: #666; }
        .mkt-sat-cell { display: flex; align-items: center; gap: 8px; }
        .mkt-op-logo { width: 22px; height: 22px; flex: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 9px; font-weight: 600; color: #fff; background: rgba(255,255,255,0.04); }
        .mkt-sat-name { font-size: 13px; font-weight: 500; color: #fff; }
        .mkt-op-name { font-size: 10px; color: #666; font-family: var(--font-mono, "SF Mono", "Menlo", monospace); }
        .mkt-cell { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 12px; color: #909097; }
        .mkt-cell b { color: #fff; font-weight: 500; }
        .mkt-match { display: flex; align-items: center; gap: 6px; }
        .mkt-match-bar { width: 30px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .mkt-match-bar span { display: block; height: 100%; background: #5b8def; }
        .mkt-match-pct { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 11px; color: #5b8def; }

        .mkt-feed-item { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 11px; color: #909097; }
        .mkt-feed-item b { color: #d8d8de; font-weight: 500; }
        .mkt-feed-item .t { color: #666; font-size: 9.5px; display: block; margin-top: 3px; }
        .mkt-feed-item.ok b { color: #4ecb71; }

        .mkt-detail-card { border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2); margin-top: auto; }
        .mkt-detail-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .mkt-detail-head .tag { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 10.5px; letter-spacing: 0.08em; color: #666; }
        .mkt-detail-head .sat { font-size: 18px; font-weight: 500; color: #fff; }
        .mkt-countdown { color: #ffcc33; }
        
        .mkt-detail-body { display: grid; grid-template-columns: repeat(4, 1fr); }
        .mkt-stat { padding: 14px 24px; border-right: 1px solid rgba(255,255,255,0.04); }
        .mkt-stat:last-child { border-right: none; }
        .mkt-stat .l { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 9.5px; letter-spacing: 0.08em; color: #909097; margin-bottom: 6px; }
        .mkt-stat .v { font-size: 14px; font-weight: 500; color: #fff; }
        .mkt-stat .v.ok { color: #4ecb71; }
        
        .mkt-book-zone { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-top: 1px solid rgba(255,255,255,0.04); }
        .mkt-book-zone .esc { font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 11px; color: #666; }
        .mkt-book-btn {
          font-family: var(--font-mono, "SF Mono", "Menlo", monospace); font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          color: #fff; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 10px 24px; cursor: pointer;
        }
        .mkt-book-btn:hover { background: rgba(255,255,255,0.2); }

        .mkt-close-btn { position: absolute; top: 12px; right: 16px; background: none; border: none; color: #909097; font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; }
        .mkt-close-btn:hover { color: #fff; }
      </style>

      <div class="mkt-stage">
        <button class="mkt-close-btn" data-close-marketplace aria-label="Close">&times;</button>
        
        <div class="mkt-marquee">
          <div class="mkt-marquee-track">
            <span>●</span> <b>SAT-19</b> booked by 0x71a…4f2 &middot; <span>●</span> escrow released on <b>SAT-04</b> &middot; \$58.00 &rarr; operator &middot; <span>●</span> <b>SAT-31</b> telemetry verified, 99.2% match &middot; <span>●</span> new listing: <b>SAT-22</b> over South Atlantic, 40 Mbps &middot; <span>●</span> <b>SAT-19</b> booked by 0x71a…4f2 &middot; <span>●</span> escrow released on <b>SAT-04</b> &middot; \$58.00 &rarr; operator &middot; <span>●</span> <b>SAT-31</b> telemetry verified, 99.2% match &middot; <span>●</span> new listing: <b>SAT-22</b> over South Atlantic, 40 Mbps &middot;
          </div>
        </div>

        <div class="mkt-topbar">
          <div class="mkt-brand">
            <img src="./DSRM_logo.png" alt="DSRM"> @DRSM_LOGO <small>/ live network</small>
          </div>
          <div class="mkt-tabs">
            <div class="app-tab active" id="tab-marketplace" data-target="content-marketplace"><div class="name">MARKETPLACE</div><div class="live"><span class="d"></span><span>128 live</span></div></div>
            <div class="app-tab" id="tab-bookings" data-target="content-bookings"><div class="name">MY BOOKINGS</div><div class="live"><span class="d"></span><span>3 total</span></div></div>
            <div class="app-tab" id="tab-escrow" data-target="content-escrow"><div class="name">ESCROW</div><div class="live"><span class="d"></span><span>1 active</span></div></div>
            <div class="app-tab" id="tab-telemetry" data-target="content-telemetry"><div class="name">TELEMETRY ORACLE</div><div class="live"><span class="d"></span><span>streaming</span></div></div>
            <div class="app-tab" id="tab-operator" data-target="content-operator"><div class="name">OPERATOR</div><div class="live"><span class="d"></span><span>4 listed</span></div></div>
            <div class="app-tab" id="tab-agent" data-target="content-agent"><div class="name">AGENT API</div><div class="live"><span class="d"></span><span>19 active</span></div></div>
          </div>
          <div class="mkt-wallet"><span class="dot"></span><span class="addr">0x4f2a…9c1e</span><span class="net">SEPOLIA</span></div>
        </div>

                <div id="content-marketplace" class="mkt-tab-content active">
          <div class="mkt-ask-zone">
          <div class="mkt-ask-label">ASK THE NETWORK</div>
          <div class="mkt-ask-bar">
            <div class="query">I need 10 minutes of connectivity over India tomorrow morning.<span class="cursor"></span></div>
            <div class="run">SEARCH &rarr;</div>
          </div>

          <div class="mkt-filters">
            <div class="mkt-filter">
              <div class="fl">LOCATION</div>
              <select><option>India</option><option>Global</option></select>
            </div>
            <div class="mkt-filter">
              <div class="fl">BANDWIDTH <span class="val">≥ 20 Mbps</span></div>
              <input type="range" min="1" max="200" value="20">
            </div>
            <div class="mkt-filter">
              <div class="fl">BUDGET <span class="val">≤ \$50</span></div>
              <input type="range" min="5" max="500" value="50">
            </div>
            <div class="mkt-filter">
              <div class="fl">DURATION</div>
              <select><option>10 min</option><option>60 min</option></select>
            </div>
            <div class="mkt-filter">
              <div class="fl">WINDOW</div>
              <select><option>Tomorrow AM</option><option>Today</option></select>
            </div>
          </div>
        </div>

        <div class="mkt-body-grid">
          <div class="mkt-col mkt-col-left">
            <div class="mkt-section-title"><span class="d"></span>REQUIREMENTS PARSED</div>
            <div>
              <div class="mkt-req-row"><div class="mkt-req-key">Location</div><div class="mkt-req-val">India</div></div>
              <div class="mkt-req-row"><div class="mkt-req-key">Duration</div><div class="mkt-req-val">≥ 10 min</div></div>
              <div class="mkt-req-row"><div class="mkt-req-key">Window</div><div class="mkt-req-val">Tomorrow &middot; AM</div></div>
              <div class="mkt-req-row"><div class="mkt-req-key">Bandwidth</div><div class="mkt-req-val">≥ 20 Mbps</div></div>
              <div class="mkt-req-row"><div class="mkt-req-key">Budget</div><div class="mkt-req-val">≤ \$50 USDC</div></div>
            </div>
            <div class="mkt-scan-box">Scanning <b>1,240 upcoming passes</b> across 9 constellations. Geometry, timing, and price filters narrowed the field to <b>3 candidates</b>.</div>
          </div>

          <div class="mkt-col">
            <div class="mkt-section-title"><span class="d"></span>RANKED CANDIDATES</div>
            <div class="mkt-cand-head"><div>#</div><div>SATELLITE</div><div>PASS WINDOW</div><div>THROUGHPUT</div><div>PRICE</div><div>MATCH</div></div>

            <div class="mkt-cand-row selected" onclick="selectCandidate(this)" data-sat="SAT-07" data-op="ORBITEX" data-win="06:42 &ndash; 06:52 IST" data-bw="32" data-px="41">
              <div class="mkt-rank-num">01</div>
              <div class="mkt-sat-cell"><div class="mkt-op-logo">OX</div><div><div class="mkt-sat-name">SAT-07</div><div class="mkt-op-name">ORBITEX</div></div></div>
              <div class="mkt-cell">06:42 IST</div>
              <div class="mkt-cell"><b>32</b> Mbps</div>
              <div class="mkt-cell"><b>\$41</b></div>
              <div class="mkt-match"><div class="mkt-match-bar"><span style="width:98%"></span></div><div class="mkt-match-pct">98%</div></div>
            </div>
            <div class="mkt-cand-row" onclick="selectCandidate(this)" data-sat="SAT-14" data-op="MERIDIAN SPACE" data-win="07:11 &ndash; 07:21 IST" data-bw="26" data-px="38">
              <div class="mkt-rank-num">02</div>
              <div class="mkt-sat-cell"><div class="mkt-op-logo">MR</div><div><div class="mkt-sat-name">SAT-14</div><div class="mkt-op-name">MERIDIAN SPACE</div></div></div>
              <div class="mkt-cell">07:11 IST</div>
              <div class="mkt-cell"><b>26</b> Mbps</div>
              <div class="mkt-cell"><b>\$38</b></div>
              <div class="mkt-match"><div class="mkt-match-bar"><span style="width:81%"></span></div><div class="mkt-match-pct">81%</div></div>
            </div>
            <div class="mkt-cand-row" onclick="selectCandidate(this)" data-sat="SAT-02" data-op="HELIOSAT" data-win="05:58 &ndash; 06:08 IST" data-bw="20" data-px="47">
              <div class="mkt-rank-num">03</div>
              <div class="mkt-sat-cell"><div class="mkt-op-logo">HS</div><div><div class="mkt-sat-name">SAT-02</div><div class="mkt-op-name">HELIOSAT</div></div></div>
              <div class="mkt-cell">05:58 IST</div>
              <div class="mkt-cell"><b>20</b> Mbps</div>
              <div class="mkt-cell"><b>\$47</b></div>
              <div class="mkt-match"><div class="mkt-match-bar"><span style="width:74%"></span></div><div class="mkt-match-pct">74%</div></div>
            </div>
            <div class="mkt-cand-row" onclick="selectCandidate(this)" data-sat="SAT-22" data-op="STARPATH" data-win="08:15 &ndash; 08:25 IST" data-bw="40" data-px="52">
              <div class="mkt-rank-num">04</div>
              <div class="mkt-sat-cell"><div class="mkt-op-logo">SP</div><div><div class="mkt-sat-name">SAT-22</div><div class="mkt-op-name">STARPATH</div></div></div>
              <div class="mkt-cell">08:15 IST</div>
              <div class="mkt-cell"><b>40</b> Mbps</div>
              <div class="mkt-cell"><b>\$52</b></div>
              <div class="mkt-match"><div class="mkt-match-bar"><span style="width:68%"></span></div><div class="mkt-match-pct">68%</div></div>
            </div>
            <div class="mkt-cand-row" onclick="selectCandidate(this)" data-sat="SAT-11" data-op="ORBITEX" data-win="09:30 &ndash; 09:40 IST" data-bw="25" data-px="35">
              <div class="mkt-rank-num">05</div>
              <div class="mkt-sat-cell"><div class="mkt-op-logo">OX</div><div><div class="mkt-sat-name">SAT-11</div><div class="mkt-op-name">ORBITEX</div></div></div>
              <div class="mkt-cell">09:30 IST</div>
              <div class="mkt-cell"><b>25</b> Mbps</div>
              <div class="mkt-cell"><b>\$35</b></div>
              <div class="mkt-match"><div class="mkt-match-bar"><span style="width:62%"></span></div><div class="mkt-match-pct">62%</div></div>
            </div>
          </div>

          <div class="mkt-col mkt-col-right">
            <div class="mkt-section-title"><span class="d"></span>LIVE FEED</div>
            <div id="mktFeedList">
              <div class="mkt-feed-item ok"><b>SAT-31</b> telemetry verified<span class="t">2s ago</span></div>
              <div class="mkt-feed-item"><b>0x8c1…2ab</b> booked SAT-19<span class="t">14s ago</span></div>
              <div class="mkt-feed-item ok"><b>SAT-04</b> escrow released, \$58<span class="t">41s ago</span></div>
              <div class="mkt-feed-item"><b>Heliosat</b> listed 3 new windows<span class="t">1m ago</span></div>
              <div class="mkt-feed-item"><b>0x2f9…c31</b> agent auto-booked<span class="t">2m ago</span></div>
            </div>
          </div>
        </div>

        <div class="mkt-detail-card">
          <div class="mkt-detail-head">
            <div><div class="tag">SELECTED WINDOW</div><div class="sat">SAT-07 <span style="color:#909097; font-weight:400;">&middot; ORBITEX</span></div></div>
            <div class="tag">EXPIRES IN <span class="mkt-countdown">04:52</span></div>
          </div>
          <div class="mkt-detail-body">
            <div class="mkt-stat"><div class="l">PASS WINDOW</div><div class="v">06:42 &ndash; 06:52 IST</div></div>
            <div class="mkt-stat"><div class="l">THROUGHPUT AVG</div><div class="v">32 Mbps</div></div>
            <div class="mkt-stat"><div class="l">PRICE</div><div class="v">\$41.00 USDC</div></div>
            <div class="mkt-stat"><div class="l">OPERATOR BOND</div><div class="v ok">STAKED &check;</div></div>
          </div>
          <div class="mkt-book-zone">
            <div class="esc">Funds lock in escrow contract on booking &middot; released on verified delivery</div>
            <button class="mkt-book-btn">BOOK WINDOW</button>
          </div>
        </div>
        
        <div id="content-bookings" class="mkt-tab-content"><div class="s-page" id="bookings-view"></div></div>
        <div id="content-escrow" class="mkt-tab-content"><div class="s-page" id="escrow-view"></div></div>
        <div id="content-telemetry" class="mkt-tab-content"><div class="s-page" id="telemetry-view"></div></div>
        <div id="content-operator" class="mkt-tab-content"><div class="s-page" id="operator-view"></div></div>
        <div id="content-agent" class="mkt-tab-content">
          <div class="s-page" style="color:var(--text-m);font-family:var(--mono);">
            <div class="s-head">AGENT API / DOCS</div>
            <div class="s-desc">Programmatic access to the Orbital Access Exchange. Testnet prototype.</div>
            <div class="s-section"><div class="s-section-h">ENDPOINTS</div>
              <div class="s-row"><div class="s-row-k">GET /api/resources</div><div class="s-row-v">List available satellite resources</div></div>
              <div class="s-row"><div class="s-row-k">POST /api/book</div><div class="s-row-v">Create a new booking</div></div>
              <div class="s-row"><div class="s-row-k">GET /api/bookings/:id</div><div class="s-row-v">Get booking details and status</div></div>
              <div class="s-row"><div class="s-row-k">GET /api/telemetry/:id</div><div class="s-row-v">Stream telemetry data for a booking</div></div>
              <div class="s-row"><div class="s-row-k">GET /api/escrow/:id</div><div class="s-row-v">Check escrow contract status</div></div>
              <div class="s-row"><div class="s-row-k">GET /api/wallet</div><div class="s-row-v">Get wallet balances and transactions</div></div>
            </div>
            <div class="s-section" style="margin-top:16px;"><div class="s-section-h">AUTHENTICATION</div>
              <div class="s-row"><div class="s-row-k">Method</div><div class="s-row-v">Web3 Wallet Signature (EIP-4361)</div></div>
              <div class="s-row"><div class="s-row-k">Network</div><div class="s-row-v">Sepolia Testnet</div></div>
              <div class="s-row"><div class="s-row-k">Rate Limit</div><div class="s-row-v">100 req/min</div></div>
            </div>
          </div>
        </div>

        <!-- Wallet Modal -->
        <div class="wl-overlay" id="wl-overlay">
          <div class="wl-box">
            <div class="wl-hd">
              <div class="wl-title"><span style="width:6px;height:6px;background:#4ecb71;border-radius:50;display:inline-block;"></span> WALLET</div>
              <button class="wl-close" id="wl-close">&times;</button>
            </div>
            <div class="wl-body" id="wl-content"></div>
          </div>
        </div>

        <!-- Demo Controls -->
        <div class="demo-wrap" id="demo-wrap">
          <div class="demo-menu" id="demo-menu">
            <button onclick="transition('FUNDS_LOCKED')">01 · FUNDS LOCKED</button>
            <button onclick="transition('SERVICE_ACTIVE')">02 · START SERVICE</button>
            <button onclick="transition('TELEMETRY_RECEIVED')">03 · RECEIVE TELEMETRY</button>
            <button onclick="transition('VERIFICATION_COMPLETE')">04 · VERIFY SERVICE</button>
            <button onclick="transition('PAYMENT_RELEASED')">05 · RELEASE PAYMENT</button>
            <button onclick="transition('VERIFICATION_FAILED')" style="border-color:rgba(255,74,74,0.2);">TRIGGER FAILURE</button>
            <button onclick="transition('REFUND_INITIATED')" style="border-color:rgba(255,74,74,0.2);">INITIATE REFUND</button>
            <button onclick="resetApp()">RESET</button>
          </div>
          <button class="demo-tog" id="demo-tog">DEMO CONTROLS</button>
        </div>

      </div>
    </div>
  </div>

  `;

    // Run the inline script globally
    const scriptEl = document.createElement('script');
    scriptEl.innerHTML = `
// === CENTRALIZED APPLICATION STATE ===
const APP = {
  state: 'FUNDS_LOCKED',
  booking: { id:'OA-1042', satellite:'SAT-07', operator:'ORBITEX', resource:'Bandwidth', location:'India', orbit:'LEO', altitude:'550 km', start:'10:31', end:'10:41', duration:10, bandwidth:50, reqBw:20, obsBw:24.7, price:42, network:'Sepolia', contract:'0x7a92...e81c', tx:'0x8f31...a92d', buyer:'0x4F3...9A28', opAddr:'0x82B...C410' },
  wallet: { addr:'0x4F3a92b8C1E9a28', network:'Sepolia Testnet', available:82.50, inEscrow:42.00, txs:[
    {type:'deposit',label:'Escrow Deposit',sat:'SAT-07',amount:-42,time:'14:32 UTC'},
    {type:'release',label:'Payment Released',sat:'SAT-03',amount:28,time:'12:15 UTC'},
    {type:'refund',label:'Refund',sat:'SAT-18',amount:15,time:'09:45 UTC'}
  ]},
  telemetry: { dur:'09:58', bw:24.7, loss:0.3, sig:'Excellent', snr:42.6, pts:[24.1,25.3,23.8,24.9,24.7,25.1,24.3], gs:[
    {id:'SATNOGS-112',loc:'Bengaluru',time:'10:32–10:38',sig:'Good'},
    {id:'SATNOGS-284',loc:'Singapore',time:'10:33–10:39',sig:'Good'},
    {id:'SATNOGS-317',loc:'Perth',time:'10:34–10:40',sig:'Good'}
  ], hash:'0x7a92e4b8c1...e81c', obsId:'#384721' },
  bookings: [
    {id:'OA-1042',sat:'SAT-07',res:'Bandwidth',loc:'India',win:'10:31–10:41',amt:42,status:'FUNDS_LOCKED'},
    {id:'OA-1031',sat:'SAT-03',res:'Bandwidth',loc:'India',win:'08:12–08:27',amt:28,status:'COMPLETED'},
    {id:'OA-1027',sat:'SAT-18',res:'Bandwidth',loc:'India',win:'06:45–07:00',amt:15,status:'REFUNDED'}
  ],
  resources: [
    {id:'SAT-07',op:'ORBITEX',res:'Bandwidth',bw:50,loc:'India',status:'AVAILABLE',orbit:'LEO'},
    {id:'SAT-12',op:'MERIDIAN',res:'Bandwidth',bw:30,loc:'India',status:'RESERVED',orbit:'LEO'},
    {id:'SAT-03',op:'HELIOSAT',res:'Observation',bw:25,loc:'Asia',status:'AVAILABLE',orbit:'MEO'},
    {id:'SAT-18',op:'STARPATH',res:'Bandwidth',bw:40,loc:'India',status:'IN SERVICE',orbit:'LEO'}
  ],
  opWindows: [
    {time:'09:10–09:20',status:'AVAILABLE'},{time:'10:31–10:41',status:'BOOKED'},
    {time:'12:15–12:25',status:'AVAILABLE'},{time:'14:20–14:35',status:'AVAILABLE'}
  ],
  serviceProgress: 0, selectedResource: 0
};

// Status badge helper
function badge(status) {
  const m = {
    'FUNDS_LOCKED':['FUNDS LOCKED','warn'],'BOOKING_CREATED':['BOOKED','info'],
    'SERVICE_ACTIVE':['IN SERVICE','info'],'TELEMETRY_RECEIVED':['TELEMETRY OK','ok'],
    'VERIFICATION_COMPLETE':['VERIFIED','ok'],'PAYMENT_RELEASED':['COMPLETED','ok'],
    'VERIFICATION_FAILED':['FAILED','fail'],'REFUND_INITIATED':['REFUNDED','fail'],
    'COMPLETED':['COMPLETED','ok'],'REFUNDED':['REFUNDED','off'],
    'AVAILABLE':['AVAILABLE','ok'],'RESERVED':['RESERVED','warn'],
    'IN SERVICE':['IN SERVICE','info'],'BOOKED':['BOOKED','warn']
  };
  const [l,c] = m[status]||[status,'off'];
  return '<span class="s-badge '+c+'">'+l+'</span>';
}

function utcNow() { return new Date().toISOString().substr(11,8)+' UTC'; }

// === STATE MACHINE ===
function transition(newState) {
  APP.state = newState;
  APP.bookings[0].status = newState;
  if (newState === 'FUNDS_LOCKED') {
    APP.serviceProgress = 0;
  }
  if (newState === 'SERVICE_ACTIVE') {
    APP.serviceProgress = 0;
    startServiceTimer();
  }
  if (newState === 'PAYMENT_RELEASED') {
    APP.wallet.available += APP.booking.price;
    APP.wallet.inEscrow = Math.max(0, APP.wallet.inEscrow - APP.booking.price);
    APP.wallet.txs.unshift({type:'release',label:'Payment Released',sat:APP.booking.satellite,amount:APP.booking.price,time:utcNow()});
  }
  if (newState === 'REFUND_INITIATED') {
    APP.wallet.available += APP.booking.price;
    APP.wallet.inEscrow = Math.max(0, APP.wallet.inEscrow - APP.booking.price);
    APP.wallet.txs.unshift({type:'refund',label:'Refund',sat:APP.booking.satellite,amount:APP.booking.price,time:utcNow()});
  }
  renderAll();
}

let serviceTimer = null;
function startServiceTimer() {
  if (serviceTimer) clearInterval(serviceTimer);
  APP.serviceProgress = 0;
  serviceTimer = setInterval(() => {
    APP.serviceProgress = Math.min(100, APP.serviceProgress + 2);
    const el = document.getElementById('svc-progress');
    const et = document.getElementById('svc-time');
    if (el) el.style.width = APP.serviceProgress + '%';
    if (et) {
      const sec = Math.round((APP.serviceProgress/100)*600);
      const m = String(Math.floor(sec/60)).padStart(2,'0');
      const s = String(sec%60).padStart(2,'0');
      et.textContent = m+':'+s+' / 10:00';
    }
    if (APP.serviceProgress >= 100 && serviceTimer) { clearInterval(serviceTimer); serviceTimer = null; }
  }, 200);
}

function resetApp() {
  if (serviceTimer) { clearInterval(serviceTimer); serviceTimer = null; }
  APP.state = 'FUNDS_LOCKED';
  APP.serviceProgress = 0;
  APP.wallet.available = 82.50;
  APP.wallet.inEscrow = 42.00;
  APP.wallet.txs = [
    {type:'deposit',label:'Escrow Deposit',sat:'SAT-07',amount:-42,time:'14:32 UTC'},
    {type:'release',label:'Payment Released',sat:'SAT-03',amount:28,time:'12:15 UTC'},
    {type:'refund',label:'Refund',sat:'SAT-18',amount:15,time:'09:45 UTC'}
  ];
  APP.bookings[0].status = 'FUNDS_LOCKED';
  renderAll();
}

// === TIMELINE HELPER ===
function tlNode(label, sub, stateMap) {
  const s = stateMap;
  return '<div class="s-tl-n '+s+'"><div class="s-tl-d">'+(s==='done'?'✓':s==='fail'?'✕':'')+'</div><div class="s-tl-t">'+label+'</div><div class="s-tl-s">'+sub+'</div></div>';
}
function getTimeline() {
  const st = APP.state;
  const states = ['BOOKING_CREATED','FUNDS_LOCKED','SERVICE_ACTIVE','TELEMETRY_RECEIVED','VERIFICATION_COMPLETE','PAYMENT_RELEASED'];
  const labels = ['BOOKED','LOCKED','SERVICE','TELEMETRY','VERIFIED','RELEASED'];
  const subs = ['14:32 UTC','\$42 USDC','10:31–10:41','Oracle','On-chain','Settlement'];
  const idx = states.indexOf(st);
  const isFail = st === 'VERIFICATION_FAILED' || st === 'REFUND_INITIATED';

  let html = '<div class="s-tl">';
  for (let i = 0; i < labels.length; i++) {
    let cls = '';
    if (isFail) {
      if (i <= 2) cls = 'done';
      else if (i === 3) cls = 'fail';
      else if (i === 4 && st === 'REFUND_INITIATED') { html += tlNode('REFUND','✓ Processed','done'); continue; }
      else cls = '';
    } else {
      if (i < idx) cls = 'done';
      else if (i === idx) cls = idx === states.length-1 ? 'done' : 'active';
      else cls = '';
    }
    html += tlNode(labels[i], cls==='done'?'✓ '+subs[i] : cls==='active'?'● Active' : subs[i], cls);
  }
  html += '</div>';
  return html;
}

// === RENDER FUNCTIONS ===
function renderBookings() {
  const el = document.getElementById('bookings-view');
  if (!el) return;
  el.innerHTML = \`
    <div><div class="s-head">MY BOOKINGS</div><div class="s-desc">Track satellite resource reservations and service status.</div></div>
    <div class="s-filters">
      <button class="s-fbtn on">ALL</button><button class="s-fbtn">UPCOMING</button><button class="s-fbtn">IN PROGRESS</button><button class="s-fbtn">COMPLETED</button><button class="s-fbtn">CANCELLED</button>
    </div>
    <div class="s-section"><table class="s-tbl"><thead><tr><th>BOOKING</th><th>SATELLITE</th><th>RESOURCE</th><th>LOCATION</th><th>WINDOW</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>
      \${APP.bookings.map(b=>\`<tr\${b.id===APP.booking.id?' class="sel"':''}>
        <td>#\${b.id}</td><td>\${b.sat}</td><td>\${b.res}</td><td>\${b.loc}</td><td>\${b.win} UTC</td><td>\$\${b.amt.toFixed(2)}</td><td>\${badge(b.status)}</td>
        <td><button class="s-btn" onclick="document.getElementById('tab-escrow').click()">VIEW →</button></td>
      </tr>\`).join('')}
    </tbody></table></div>\`;
}

function renderEscrow() {
  const el = document.getElementById('escrow-view');
  if (!el) return;
  const b = APP.booking;
  const isFail = APP.state==='VERIFICATION_FAILED'||APP.state==='REFUND_INITIATED';
  const isActive = APP.state==='SERVICE_ACTIVE';
  const isDone = APP.state==='PAYMENT_RELEASED';

  el.innerHTML = \`
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div><div class="s-head">ESCROW</div><div class="s-desc">Programmable settlement for verified satellite services.</div></div>
      <div class="s-live" id="utc-clock">LIVE · \${utcNow()}</div>
    </div>
    <div class="s-strip">
      <div class="s-strip-i"><div class="s-strip-l">ACTIVE ESCROWS</div><div class="s-strip-v">\${isDone||isFail?'00':'01'}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">FUNDS LOCKED</div><div class="s-strip-v">\$\${APP.wallet.inEscrow.toFixed(2)}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">PENDING VERIFICATION</div><div class="s-strip-v">\${APP.state==='FUNDS_LOCKED'||APP.state==='SERVICE_ACTIVE'||APP.state==='TELEMETRY_RECEIVED'?'01':'00'}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">RELEASED</div><div class="s-strip-v">\$\${isDone?'70.00':'28.00'}</div></div>
    </div>
    <div class="s-section">
      <div class="s-section-h"><span>BOOKING #\${b.id}</span>\${badge(APP.state)}</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);">
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Satellite</div><div class="s-row-v" style="margin-top:4px;">\${b.satellite}</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Resource</div><div class="s-row-v" style="margin-top:4px;">\${b.resource}</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Location</div><div class="s-row-v" style="margin-top:4px;">\${b.location}</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Window</div><div class="s-row-v" style="margin-top:4px;">\${b.start}–\${b.end} UTC</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Amount</div><div class="s-row-v" style="margin-top:4px;">\$\${b.price.toFixed(2)} USDC</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-bottom:none;"><div class="s-row-k">Network</div><div class="s-row-v" style="margin-top:4px;">\${b.network}</div></div>
      </div>
    </div>
    <div class="s-section">
      <div class="s-section-h">ESCROW WORKFLOW</div>
      <div style="padding:8px 16px;">\${getTimeline()}</div>
    </div>
    \${isActive?\`<div class="s-monitor"><span class="dot"></span>SERVICE WINDOW ACTIVE <span id="svc-time" style="color:#fff;margin-left:auto;">00:00 / 10:00</span></div><div class="s-prog"><div class="s-prog-f" id="svc-progress" style="width:\${APP.serviceProgress}%"></div></div>\`:''}
    <div class="s-2col">
      <div class="s-section">
        <div class="s-section-h">CONTRACT DETAILS</div>
        <div class="s-row"><div class="s-row-k">Booking ID</div><div class="s-row-v">#\${b.id}</div></div>
        <div class="s-row"><div class="s-row-k">Satellite</div><div class="s-row-v">\${b.satellite} · \${b.orbit} · \${b.altitude}</div></div>
        <div class="s-row"><div class="s-row-k">Resource</div><div class="s-row-v">\${b.resource} · \${b.bandwidth} Mbps</div></div>
        <div class="s-row"><div class="s-row-k">Coverage</div><div class="s-row-v">\${b.location}</div></div>
        <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">\${b.duration} min</div></div>
        <div class="s-row"><div class="s-row-k">Price</div><div class="s-row-v">\$\${b.price.toFixed(2)} USDC</div></div>
        <div class="s-row"><div class="s-row-k">Buyer</div><div class="s-row-v">\${b.buyer}</div></div>
        <div class="s-row"><div class="s-row-k">Operator</div><div class="s-row-v">\${b.opAddr}</div></div>
        <div class="s-row"><div class="s-row-k">Contract</div><div class="s-row-v">\${b.contract}</div></div>
        <div class="s-row"><div class="s-row-k">Transaction</div><div class="s-row-v">\${b.tx}</div></div>
      </div>
      <div>
        <div class="s-section">
          <div class="s-section-h">SERVICE VERIFICATION</div>
          <div class="s-row" style="background:var(--surface);"><div class="s-row-k" style="color:#fff;font-weight:600;">EXPECTED</div><div class="s-row-v"></div></div>
          <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">10 min</div></div>
          <div class="s-row"><div class="s-row-k">Bandwidth</div><div class="s-row-v">≥\${b.reqBw} Mbps</div></div>
          <div class="s-row"><div class="s-row-k">Window</div><div class="s-row-v">\${b.start}–\${b.end} UTC</div></div>
          <div class="s-row" style="background:var(--surface);"><div class="s-row-k" style="color:#fff;font-weight:600;">OBSERVED</div><div class="s-row-v"></div></div>
          <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">\${APP.telemetry.dur}</div></div>
          <div class="s-row"><div class="s-row-k">Avg Bandwidth</div><div class="s-row-v">\${isFail?'12.4':APP.telemetry.bw} Mbps</div></div>
          <div class="s-row"><div class="s-row-k">Packet Loss</div><div class="s-row-v">\${APP.telemetry.loss}%</div></div>
          <div class="s-row"><div class="s-row-k">Signal</div><div class="s-row-v">\${APP.telemetry.sig}</div></div>
        </div>
        \${isFail?\`<div class="s-section" style="margin-top:12px;border-color:rgba(255,74,74,0.2);"><div class="s-section-h" style="color:var(--fail);">VERIFICATION FAILED</div><div class="s-row"><div class="s-row-k">Expected</div><div class="s-row-v">≥20 Mbps</div></div><div class="s-row"><div class="s-row-k">Observed</div><div class="s-row-v" style="color:var(--fail);">12.4 Mbps</div></div><div class="s-row"><div class="s-row-k">Result</div><div class="s-row-v">\${badge('REFUND_INITIATED')}</div></div></div>\`:''}
        <div class="s-section" style="margin-top:12px;">
          <div class="s-section-h">EVIDENCE</div>
          <div class="s-row"><div class="s-row-k">Telemetry Hash</div><div class="s-row-v">\${APP.telemetry.hash}</div></div>
          <div class="s-row"><div class="s-row-k">Observation ID</div><div class="s-row-v">\${APP.telemetry.obsId}</div></div>
          <div class="s-row"><div class="s-row-k">Timestamp</div><div class="s-row-v">16 Sep 2026 · 10:40:12 UTC</div></div>
          <div class="s-row"><div class="s-row-k">Oracle</div><div class="s-row-v">\${badge(APP.state==='FUNDS_LOCKED'||APP.state==='SERVICE_ACTIVE'?'RESERVED':'COMPLETED')}</div></div>
          <div class="s-row"><div class="s-row-k">Blockchain</div><div class="s-row-v">\${badge(APP.state==='PAYMENT_RELEASED'||APP.state==='REFUND_INITIATED'?'COMPLETED':'RESERVED')}</div></div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="s-btn" onclick="document.getElementById('tab-telemetry').click()">VIEW TELEMETRY →</button>
          <button class="s-btn">VIEW PROOF →</button>
        </div>
      </div>
    </div>\`;
  if (isActive) startServiceTimer();
}

function renderTelemetry() {
  const el = document.getElementById('telemetry-view');
  if (!el) return;
  const pts = APP.telemetry.pts;
  const W=380, H=80;
  const polyPts = pts.map((v,i)=>{
    const x = 20+(i/(pts.length-1))*(W-40);
    const y = H-((v-20)/10)*H;
    return x+','+y;
  }).join(' ');
  const circles = pts.map((v,i)=>{
    const x = 20+(i/(pts.length-1))*(W-40);
    const y = H-((v-20)/10)*H;
    return '<circle cx="'+x+'" cy="'+y+'" r="3" fill="#5b8def"/>';
  }).join('');
  const times = ['10:31','10:33','10:35','10:37','10:39','10:40','10:41'];

  el.innerHTML = \`
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div><div class="s-head">TELEMETRY ORACLE</div><div class="s-desc">Independent verification of service delivery. Simulated telemetry for prototype demonstration.</div></div>
      <div class="s-live">OPERATIONAL</div>
    </div>
    <div class="s-strip">
      <div class="s-strip-i"><div class="s-strip-l">SELECTED BOOKING</div><div class="s-strip-v">#\${APP.booking.id}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">SATELLITE</div><div class="s-strip-v">\${APP.booking.satellite}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">SERVICE WINDOW</div><div class="s-strip-v">\${APP.booking.start}–\${APP.booking.end} UTC</div></div>
      <div class="s-strip-i"><div class="s-strip-l">ACTIVE SATELLITES</div><div class="s-strip-v">12</div></div>
      <div class="s-strip-i"><div class="s-strip-l">GROUND STATIONS</div><div class="s-strip-v">8</div></div>
      <div class="s-strip-i"><div class="s-strip-l">DATA LATENCY</div><div class="s-strip-v">&lt;2 min</div></div>
    </div>
    <div class="s-2col">
      <div>
        <div class="s-section">
          <div class="s-section-h">LIVE METRICS \${badge(APP.state)}</div>
          <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">\${APP.telemetry.dur} <span style="color:var(--text-d);">(Expected: 10 min)</span></div></div>
          <div class="s-row"><div class="s-row-k">Average Bandwidth</div><div class="s-row-v">\${APP.telemetry.bw} Mbps <span style="color:var(--text-d);">(Expected: ≥\${APP.booking.reqBw} Mbps)</span></div></div>
          <div class="s-row"><div class="s-row-k">Packet Loss</div><div class="s-row-v">\${APP.telemetry.loss}% <span style="color:var(--text-d);">(Expected: ≤1%)</span></div></div>
          <div class="s-row"><div class="s-row-k">Signal Quality</div><div class="s-row-v">\${APP.telemetry.sig} <span style="color:var(--text-d);">(SNR: \${APP.telemetry.snr} dB)</span></div></div>
        </div>
        <div class="s-chart" style="margin-top:16px;">
          <div class="s-chart-t">BANDWIDTH OVER TIME (Mbps)</div>
          <svg id="telem-chart" width="\${W}" height="\${H+20}" viewBox="0 0 \${W} \${H+20}" style="width:100%;height:auto;">
            <line x1="20" y1="0" x2="20" y2="\${H}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
            <line x1="20" y1="\${H}" x2="\${W}" y2="\${H}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <line x1="20" y1="\${H/2}" x2="\${W}" y2="\${H/2}" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="4"/>
            <line x1="20" y1="0" x2="\${W}" y2="0" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="4"/>
            <text x="0" y="\${H+4}" fill="#666" font-size="7" font-family="var(--mono)">20</text>
            <text x="0" y="\${H/2+3}" fill="#666" font-size="7" font-family="var(--mono)">25</text>
            <text x="0" y="8" fill="#666" font-size="7" font-family="var(--mono)">30</text>
            \${pts.map((v,i)=>{const x=20+(i/(pts.length-1))*(W-40); return '<text x="'+x+'" y="'+(H+16)+'" fill="#666" font-size="6" font-family="var(--mono)" text-anchor="middle">'+times[i]+'</text>';}).join('')}
            <polyline points="\${polyPts}" fill="none" stroke="#5b8def" stroke-width="1.5" stroke-linejoin="round"/>
            \${circles}
          </svg>
        </div>
      </div>
      <div>
        <div class="s-section">
          <div class="s-section-h">GROUND STATION OBSERVATIONS</div>
          <table class="s-tbl"><thead><tr><th>STATION</th><th>LOCATION</th><th>TIME</th><th>SIGNAL</th></tr></thead><tbody>
            \${APP.telemetry.gs.map(g=>\`<tr><td>\${g.id}</td><td>\${g.loc}</td><td>\${g.time} UTC</td><td>\${badge('COMPLETED')}</td></tr>\`).join('')}
          </tbody></table>
        </div>
        <div class="s-section" style="margin-top:16px;">
          <div class="s-section-h">EVIDENCE</div>
          <div class="s-row"><div class="s-row-k">Telemetry Hash</div><div class="s-row-v">\${APP.telemetry.hash}</div></div>
          <div class="s-row"><div class="s-row-k">Observation ID</div><div class="s-row-v">\${APP.telemetry.obsId}</div></div>
          <div class="s-row"><div class="s-row-k">Timestamp</div><div class="s-row-v">16 Sep 2026 · 10:40:12 UTC</div></div>
          <div class="s-row"><div class="s-row-k">Oracle</div><div class="s-row-v">\${badge('COMPLETED')}</div></div>
          <div class="s-row"><div class="s-row-k">Blockchain</div><div class="s-row-v">\${badge(APP.state==='PAYMENT_RELEASED'?'COMPLETED':'RESERVED')}</div></div>
        </div>
        <div style="margin-top:12px;"><button class="s-btn" onclick="document.getElementById('tab-escrow').click()">VIEW ESCROW →</button></div>
      </div>
    </div>\`;
}

function renderOperator() {
  const el = document.getElementById('operator-view');
  if (!el) return;
  el.innerHTML = \`
    <div><div class="s-head">OPERATOR CONSOLE</div><div class="s-desc">Manage satellite resources and availability.</div></div>
    <div class="s-strip">
      <div class="s-strip-i"><div class="s-strip-l">LISTED RESOURCES</div><div class="s-strip-v">04</div></div>
      <div class="s-strip-i"><div class="s-strip-l">UPCOMING WINDOWS</div><div class="s-strip-v">03</div></div>
      <div class="s-strip-i"><div class="s-strip-l">ACTIVE BOOKINGS</div><div class="s-strip-v">01</div></div>
      <div class="s-strip-i"><div class="s-strip-l">EARNINGS</div><div class="s-strip-v">\$186.00</div></div>
    </div>
    <div class="s-2col">
      <div>
        <div class="s-section">
          <div class="s-section-h">RESOURCES</div>
          <table class="s-tbl"><thead><tr><th>SATELLITE</th><th>OPERATOR</th><th>RESOURCE</th><th>BANDWIDTH</th><th>COVERAGE</th><th>STATUS</th></tr></thead><tbody>
            \${APP.resources.map((r,i)=>\`<tr class="\${i===APP.selectedResource?'sel':''}" style="cursor:pointer;" onclick="APP.selectedResource=\${i};renderOperator();">
              <td>\${r.id}</td><td>\${r.op}</td><td>\${r.res}</td><td>\${r.bw} Mbps</td><td>\${r.loc}</td><td>\${badge(r.status)}</td>
            </tr>\`).join('')}
          </tbody></table>
        </div>
      </div>
      <div>
        <div class="s-section">
          <div class="s-section-h">RESOURCE DETAIL · \${APP.resources[APP.selectedResource].id}</div>
          <div class="s-row"><div class="s-row-k">Orbit</div><div class="s-row-v">\${APP.resources[APP.selectedResource].orbit}</div></div>
          <div class="s-row"><div class="s-row-k">Bandwidth</div><div class="s-row-v">\${APP.resources[APP.selectedResource].bw} Mbps</div></div>
          <div class="s-row"><div class="s-row-k">Coverage</div><div class="s-row-v">\${APP.resources[APP.selectedResource].loc}</div></div>
          <div class="s-row"><div class="s-row-k">Status</div><div class="s-row-v">\${badge(APP.resources[APP.selectedResource].status)}</div></div>
        </div>
        <div class="s-section" style="margin-top:16px;">
          <div class="s-section-h">AVAILABILITY TIMELINE · TODAY</div>
          \${APP.opWindows.map(w=>\`<div class="op-tl-row"><div class="op-tl-time">\${w.time} UTC</div><div class="op-tl-bar \${w.status==='AVAILABLE'?'avail':'booked'}"></div><div style="font-family:var(--mono);font-size:9px;color:\${w.status==='AVAILABLE'?'var(--ok)':'var(--warn)'};">\${w.status}</div></div>\`).join('')}
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;"><button class="s-btn">EDIT RESOURCE</button><button class="s-btn">VIEW WINDOWS</button></div>
      </div>
    </div>\`;
}

function renderWallet() {
  const el = document.getElementById('wl-content');
  if (!el) return;
  el.innerHTML = \`
    <div class="wl-addr"><span>\${APP.wallet.addr}</span><button onclick="navigator.clipboard.writeText('\${APP.wallet.addr}')">COPY</button></div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--text-m);margin-bottom:4px;">CONNECTED · \${APP.wallet.network}</div>
    <div class="wl-bal"><div class="wl-bl">AVAILABLE</div><div class="wl-bv">\$\${APP.wallet.available.toFixed(2)} USDC</div></div>
    <div class="wl-bal"><div class="wl-bl">IN ESCROW</div><div class="wl-bv">\$\${APP.wallet.inEscrow.toFixed(2)} USDC</div></div>
    <div class="wl-sh">RECENT ACTIVITY</div>
    \${APP.wallet.txs.slice(0,5).map(t=>\`<div class="wl-tx"><div class="wl-tx-i">\${t.label} · \${t.sat}</div><div class="wl-tx-a \${t.amount<0?'neg':'pos'}">\${t.amount<0?'':'+'} \$\${Math.abs(t.amount).toFixed(2)}</div></div>\`).join('')}
    <div class="wl-actions">
      <button class="s-btn" style="flex:1;">ADD FUNDS</button>
      <button class="s-btn" style="flex:1;" onclick="document.getElementById('tab-escrow').click();document.getElementById('wl-overlay').classList.remove('open');">VIEW ESCROW</button>
    </div>\`;
}

function renderAll() { renderBookings(); renderEscrow(); renderTelemetry(); renderOperator(); renderWallet(); }

// === TELEMETRY ANIMATION ===
setInterval(() => {
  if (APP.state === 'SERVICE_ACTIVE' || APP.state === 'TELEMETRY_RECEIVED') {
    const newVal = 22 + Math.random() * 6;
    APP.telemetry.pts.push(Math.round(newVal*10)/10);
    if (APP.telemetry.pts.length > 12) APP.telemetry.pts.shift();
    APP.telemetry.bw = Math.round(newVal*10)/10;
    // Update chart if visible
    const chart = document.getElementById('telem-chart');
    if (chart) renderTelemetry();
  }
}, 3000);

// === UTC CLOCK ===
setInterval(() => {
  const clk = document.getElementById('utc-clock');
  if (clk) clk.textContent = 'LIVE · ' + utcNow();
}, 1000);


    const mktModal = document.getElementById('marketplace-modal');
    const mktClose = mktModal.querySelector('[data-close-marketplace]');
    
    function openMktModal(tabId) {
      mktModal.hidden = false;
      mktModal.classList.add('is-open');
      document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
      const activeTab = document.getElementById('tab-' + tabId);
      if (activeTab) activeTab.classList.add('active');
      document.querySelectorAll('.mkt-tab-content').forEach(c => c.classList.remove('active'));
      const target = document.getElementById('content-' + tabId);
      if (target) target.classList.add('active');
      renderAll();
    }

    // Next.js routing will handle these links
    
    mktClose.addEventListener('click', () => { mktModal.hidden = true; mktModal.classList.remove('is-open'); });
    
    document.querySelectorAll('.app-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.mkt-tab-content').forEach(c => c.classList.remove('active'));
        const targetId = tab.getAttribute('data-target');
        if (targetId) { const el = document.getElementById(targetId); if (el) el.classList.add('active'); }
        renderAll();
      });
    });

    // Candidate selection
    window.selectCandidate = function(el) {
      document.querySelectorAll('.mkt-cand-row').forEach(r => r.classList.remove('selected'));
      el.classList.add('selected');
      
      const sat = el.getAttribute('data-sat');
      const op = el.getAttribute('data-op');
      const win = el.getAttribute('data-win');
      const bw = el.getAttribute('data-bw');
      const px = el.getAttribute('data-px');
      
      const headSat = document.querySelector('.mkt-detail-head .sat');
      if (headSat) headSat.innerHTML = sat + ' <span style="color:#909097; font-weight:400;">&middot; ' + op + '</span>';
      
      const stats = document.querySelectorAll('.mkt-detail-body .mkt-stat .v');
      if (stats.length >= 3) {
        stats[0].innerHTML = win;
        stats[1].innerHTML = bw + ' Mbps';
        stats[2].innerHTML = '\$' + px + '.00 USDC';
      }
      
      if (typeof APP !== 'undefined' && APP.booking) {
        APP.booking.satellite = sat;
        APP.booking.operator = op;
        APP.booking.price = parseFloat(px);
        APP.booking.start = win.split(' ')[0];
        APP.booking.end = win.split(' ')[2] || win.split(' ')[0];
        APP.booking.bandwidth = parseInt(bw);
        renderAll();
      }
      
      const detailCard = document.querySelector('.mkt-detail-card');
      if (detailCard) {
        detailCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    // Wallet modal
    const wlOverlay = document.getElementById('wl-overlay');
    document.querySelector('.mkt-wallet').addEventListener('click', e => { e.stopPropagation(); wlOverlay.classList.add('open'); renderWallet(); });
    document.getElementById('wl-close').addEventListener('click', () => wlOverlay.classList.remove('open'));
    wlOverlay.addEventListener('click', e => { if (e.target === wlOverlay) wlOverlay.classList.remove('open'); });

    // Demo controls
    document.getElementById('demo-tog').addEventListener('click', () => document.getElementById('demo-menu').classList.toggle('open'));

    // Marketplace booking flow
    const bookBtn = document.querySelector('.mkt-book-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        bookBtn.textContent = 'LOCKING FUNDS...';
        bookBtn.disabled = true;
        bookBtn.style.opacity = '0.6';
        setTimeout(() => {
          bookBtn.textContent = '✓ FUNDS LOCKED · #OA-1042';
          bookBtn.style.background = 'rgba(78,203,113,0.1)';
          bookBtn.style.borderColor = 'rgba(78,203,113,0.3)';
          bookBtn.style.color = '#4ecb71';
          bookBtn.style.opacity = '1';
          APP.state = 'FUNDS_LOCKED';
          APP.bookings[0].status = 'FUNDS_LOCKED';
          renderAll();
        }, 1500);
      });
    }

    // Live feed ticking
    const feedEvents = [
      ["SAT-22","telemetry verified",true],
      ["0x5b7…91e","booked SAT-14",false],
      ["SAT-07","escrow locked, \$41",true],
      ["Orbitex","bond top-up confirmed",false],
      ["0x9d3…44c","agent queried 12 windows",false],
      ["SAT-31","pass window closed",true]
    ];
    const feedList = document.getElementById('mktFeedList');
    let mktLiveCount = 128;
    setInterval(() => {
      if(!feedList || mktModal.hidden) return;
      const e = feedEvents[Math.floor(Math.random()*feedEvents.length)];
      const div = document.createElement('div');
      div.className = 'mkt-feed-item' + (e[2] ? ' ok' : '');
      div.innerHTML = '<b>'+e[0]+'</b> '+e[1]+'<span class="t">just now</span>';
      feedList.prepend(div);
      if(feedList.children.length > 6) { feedList.removeChild(feedList.lastChild); }
      mktLiveCount += (Math.random() > 0.5 ? 1 : -1);
      const activeTab = document.querySelector('.app-tab.active .live span:last-child');
      if(activeTab && activeTab.textContent.includes('live')) {
        activeTab.textContent = mktLiveCount + ' live';
      }
    }, 3200);

    // Initial render
    renderAll();
  `;
    document.body.appendChild(scriptEl);

    // Load Mapbox script
    const mapboxScript = document.createElement('script');
    mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.js';
    mapboxScript.onload = () => {
      const viteScript = document.createElement('script');
      viteScript.type = 'module';
      viteScript.crossOrigin = 'anonymous';
      viteScript.src = './assets/index-Ce4AZ4p4.js';
      document.body.appendChild(viteScript);
    };
    document.head.appendChild(mapboxScript);

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <>
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css" rel="stylesheet" />
      <link rel="stylesheet" crossOrigin="anonymous" href="./assets/index-BGrAeW3w.css" />
      <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative' }} />
    </>
  );
}
