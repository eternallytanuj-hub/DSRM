
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
  const subs = ['14:32 UTC','$42 USDC','10:31–10:41','Oracle','On-chain','Settlement'];
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
  el.innerHTML = `
    <div><div class="s-head">MY BOOKINGS</div><div class="s-desc">Track satellite resource reservations and service status.</div></div>
    <div class="s-filters">
      <button class="s-fbtn on">ALL</button><button class="s-fbtn">UPCOMING</button><button class="s-fbtn">IN PROGRESS</button><button class="s-fbtn">COMPLETED</button><button class="s-fbtn">CANCELLED</button>
    </div>
    <div class="s-section"><table class="s-tbl"><thead><tr><th>BOOKING</th><th>SATELLITE</th><th>RESOURCE</th><th>LOCATION</th><th>WINDOW</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>
      ${APP.bookings.map(b=>`<tr${b.id===APP.booking.id?' class="sel"':''}>
        <td>#${b.id}</td><td>${b.sat}</td><td>${b.res}</td><td>${b.loc}</td><td>${b.win} UTC</td><td>$${b.amt.toFixed(2)}</td><td>${badge(b.status)}</td>
        <td><button class="s-btn" onclick="document.getElementById('tab-escrow').click()">VIEW →</button></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

function renderEscrow() {
  const el = document.getElementById('escrow-view');
  if (!el) return;
  const b = APP.booking;
  const isFail = APP.state==='VERIFICATION_FAILED'||APP.state==='REFUND_INITIATED';
  const isActive = APP.state==='SERVICE_ACTIVE';
  const isDone = APP.state==='PAYMENT_RELEASED';

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div><div class="s-head">ESCROW</div><div class="s-desc">Programmable settlement for verified satellite services.</div></div>
      <div class="s-live" id="utc-clock">LIVE · ${utcNow()}</div>
    </div>
    <div class="s-strip">
      <div class="s-strip-i"><div class="s-strip-l">ACTIVE ESCROWS</div><div class="s-strip-v">${isDone||isFail?'00':'01'}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">FUNDS LOCKED</div><div class="s-strip-v">$${APP.wallet.inEscrow.toFixed(2)}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">PENDING VERIFICATION</div><div class="s-strip-v">${APP.state==='FUNDS_LOCKED'||APP.state==='SERVICE_ACTIVE'||APP.state==='TELEMETRY_RECEIVED'?'01':'00'}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">RELEASED</div><div class="s-strip-v">$${isDone?'70.00':'28.00'}</div></div>
    </div>
    <div class="s-section">
      <div class="s-section-h"><span>BOOKING #${b.id}</span>${badge(APP.state)}</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);">
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Satellite</div><div class="s-row-v" style="margin-top:4px;">${b.satellite}</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Resource</div><div class="s-row-v" style="margin-top:4px;">${b.resource}</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Location</div><div class="s-row-v" style="margin-top:4px;">${b.location}</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Window</div><div class="s-row-v" style="margin-top:4px;">${b.start}–${b.end} UTC</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-right:1px solid var(--border);border-bottom:none;"><div class="s-row-k">Amount</div><div class="s-row-v" style="margin-top:4px;">$${b.price.toFixed(2)} USDC</div></div>
        <div class="s-row" style="flex-direction:column;align-items:flex-start;border-bottom:none;"><div class="s-row-k">Network</div><div class="s-row-v" style="margin-top:4px;">${b.network}</div></div>
      </div>
    </div>
    <div class="s-section">
      <div class="s-section-h">ESCROW WORKFLOW</div>
      <div style="padding:8px 16px;">${getTimeline()}</div>
    </div>
    ${isActive?`<div class="s-monitor"><span class="dot"></span>SERVICE WINDOW ACTIVE <span id="svc-time" style="color:#fff;margin-left:auto;">00:00 / 10:00</span></div><div class="s-prog"><div class="s-prog-f" id="svc-progress" style="width:${APP.serviceProgress}%"></div></div>`:''}
    <div class="s-2col">
      <div class="s-section">
        <div class="s-section-h">CONTRACT DETAILS</div>
        <div class="s-row"><div class="s-row-k">Booking ID</div><div class="s-row-v">#${b.id}</div></div>
        <div class="s-row"><div class="s-row-k">Satellite</div><div class="s-row-v">${b.satellite} · ${b.orbit} · ${b.altitude}</div></div>
        <div class="s-row"><div class="s-row-k">Resource</div><div class="s-row-v">${b.resource} · ${b.bandwidth} Mbps</div></div>
        <div class="s-row"><div class="s-row-k">Coverage</div><div class="s-row-v">${b.location}</div></div>
        <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">${b.duration} min</div></div>
        <div class="s-row"><div class="s-row-k">Price</div><div class="s-row-v">$${b.price.toFixed(2)} USDC</div></div>
        <div class="s-row"><div class="s-row-k">Buyer</div><div class="s-row-v">${b.buyer}</div></div>
        <div class="s-row"><div class="s-row-k">Operator</div><div class="s-row-v">${b.opAddr}</div></div>
        <div class="s-row"><div class="s-row-k">Contract</div><div class="s-row-v">${b.contract}</div></div>
        <div class="s-row"><div class="s-row-k">Transaction</div><div class="s-row-v">${b.tx}</div></div>
      </div>
      <div>
        <div class="s-section">
          <div class="s-section-h">SERVICE VERIFICATION</div>
          <div class="s-row" style="background:var(--surface);"><div class="s-row-k" style="color:#fff;font-weight:600;">EXPECTED</div><div class="s-row-v"></div></div>
          <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">10 min</div></div>
          <div class="s-row"><div class="s-row-k">Bandwidth</div><div class="s-row-v">≥${b.reqBw} Mbps</div></div>
          <div class="s-row"><div class="s-row-k">Window</div><div class="s-row-v">${b.start}–${b.end} UTC</div></div>
          <div class="s-row" style="background:var(--surface);"><div class="s-row-k" style="color:#fff;font-weight:600;">OBSERVED</div><div class="s-row-v"></div></div>
          <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">${APP.telemetry.dur}</div></div>
          <div class="s-row"><div class="s-row-k">Avg Bandwidth</div><div class="s-row-v">${isFail?'12.4':APP.telemetry.bw} Mbps</div></div>
          <div class="s-row"><div class="s-row-k">Packet Loss</div><div class="s-row-v">${APP.telemetry.loss}%</div></div>
          <div class="s-row"><div class="s-row-k">Signal</div><div class="s-row-v">${APP.telemetry.sig}</div></div>
        </div>
        ${isFail?`<div class="s-section" style="margin-top:12px;border-color:rgba(255,74,74,0.2);"><div class="s-section-h" style="color:var(--fail);">VERIFICATION FAILED</div><div class="s-row"><div class="s-row-k">Expected</div><div class="s-row-v">≥20 Mbps</div></div><div class="s-row"><div class="s-row-k">Observed</div><div class="s-row-v" style="color:var(--fail);">12.4 Mbps</div></div><div class="s-row"><div class="s-row-k">Result</div><div class="s-row-v">${badge('REFUND_INITIATED')}</div></div></div>`:''}
        <div class="s-section" style="margin-top:12px;">
          <div class="s-section-h">EVIDENCE</div>
          <div class="s-row"><div class="s-row-k">Telemetry Hash</div><div class="s-row-v">${APP.telemetry.hash}</div></div>
          <div class="s-row"><div class="s-row-k">Observation ID</div><div class="s-row-v">${APP.telemetry.obsId}</div></div>
          <div class="s-row"><div class="s-row-k">Timestamp</div><div class="s-row-v">16 Sep 2026 · 10:40:12 UTC</div></div>
          <div class="s-row"><div class="s-row-k">Oracle</div><div class="s-row-v">${badge(APP.state==='FUNDS_LOCKED'||APP.state==='SERVICE_ACTIVE'?'RESERVED':'COMPLETED')}</div></div>
          <div class="s-row"><div class="s-row-k">Blockchain</div><div class="s-row-v">${badge(APP.state==='PAYMENT_RELEASED'||APP.state==='REFUND_INITIATED'?'COMPLETED':'RESERVED')}</div></div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="s-btn" onclick="document.getElementById('tab-telemetry').click()">VIEW TELEMETRY →</button>
          <button class="s-btn">VIEW PROOF →</button>
        </div>
      </div>
    </div>`;
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

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div><div class="s-head">TELEMETRY ORACLE</div><div class="s-desc">Independent verification of service delivery. Simulated telemetry for prototype demonstration.</div></div>
      <div class="s-live">OPERATIONAL</div>
    </div>
    <div class="s-strip">
      <div class="s-strip-i"><div class="s-strip-l">SELECTED BOOKING</div><div class="s-strip-v">#${APP.booking.id}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">SATELLITE</div><div class="s-strip-v">${APP.booking.satellite}</div></div>
      <div class="s-strip-i"><div class="s-strip-l">SERVICE WINDOW</div><div class="s-strip-v">${APP.booking.start}–${APP.booking.end} UTC</div></div>
      <div class="s-strip-i"><div class="s-strip-l">ACTIVE SATELLITES</div><div class="s-strip-v">12</div></div>
      <div class="s-strip-i"><div class="s-strip-l">GROUND STATIONS</div><div class="s-strip-v">8</div></div>
      <div class="s-strip-i"><div class="s-strip-l">DATA LATENCY</div><div class="s-strip-v">&lt;2 min</div></div>
    </div>
    <div class="s-2col">
      <div>
        <div class="s-section">
          <div class="s-section-h">LIVE METRICS ${badge(APP.state)}</div>
          <div class="s-row"><div class="s-row-k">Duration</div><div class="s-row-v">${APP.telemetry.dur} <span style="color:var(--text-d);">(Expected: 10 min)</span></div></div>
          <div class="s-row"><div class="s-row-k">Average Bandwidth</div><div class="s-row-v">${APP.telemetry.bw} Mbps <span style="color:var(--text-d);">(Expected: ≥${APP.booking.reqBw} Mbps)</span></div></div>
          <div class="s-row"><div class="s-row-k">Packet Loss</div><div class="s-row-v">${APP.telemetry.loss}% <span style="color:var(--text-d);">(Expected: ≤1%)</span></div></div>
          <div class="s-row"><div class="s-row-k">Signal Quality</div><div class="s-row-v">${APP.telemetry.sig} <span style="color:var(--text-d);">(SNR: ${APP.telemetry.snr} dB)</span></div></div>
        </div>
        <div class="s-chart" style="margin-top:16px;">
          <div class="s-chart-t">BANDWIDTH OVER TIME (Mbps)</div>
          <svg id="telem-chart" width="${W}" height="${H+20}" viewBox="0 0 ${W} ${H+20}" style="width:100%;height:auto;">
            <line x1="20" y1="0" x2="20" y2="${H}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
            <line x1="20" y1="${H}" x2="${W}" y2="${H}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <line x1="20" y1="${H/2}" x2="${W}" y2="${H/2}" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="4"/>
            <line x1="20" y1="0" x2="${W}" y2="0" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="4"/>
            <text x="0" y="${H+4}" fill="#666" font-size="7" font-family="var(--mono)">20</text>
            <text x="0" y="${H/2+3}" fill="#666" font-size="7" font-family="var(--mono)">25</text>
            <text x="0" y="8" fill="#666" font-size="7" font-family="var(--mono)">30</text>
            ${pts.map((v,i)=>{const x=20+(i/(pts.length-1))*(W-40); return '<text x="'+x+'" y="'+(H+16)+'" fill="#666" font-size="6" font-family="var(--mono)" text-anchor="middle">'+times[i]+'</text>';}).join('')}
            <polyline points="${polyPts}" fill="none" stroke="#5b8def" stroke-width="1.5" stroke-linejoin="round"/>
            ${circles}
          </svg>
        </div>
      </div>
      <div>
        <div class="s-section">
          <div class="s-section-h">GROUND STATION OBSERVATIONS</div>
          <table class="s-tbl"><thead><tr><th>STATION</th><th>LOCATION</th><th>TIME</th><th>SIGNAL</th></tr></thead><tbody>
            ${APP.telemetry.gs.map(g=>`<tr><td>${g.id}</td><td>${g.loc}</td><td>${g.time} UTC</td><td>${badge('COMPLETED')}</td></tr>`).join('')}
          </tbody></table>
        </div>
        <div class="s-section" style="margin-top:16px;">
          <div class="s-section-h">EVIDENCE</div>
          <div class="s-row"><div class="s-row-k">Telemetry Hash</div><div class="s-row-v">${APP.telemetry.hash}</div></div>
          <div class="s-row"><div class="s-row-k">Observation ID</div><div class="s-row-v">${APP.telemetry.obsId}</div></div>
          <div class="s-row"><div class="s-row-k">Timestamp</div><div class="s-row-v">16 Sep 2026 · 10:40:12 UTC</div></div>
          <div class="s-row"><div class="s-row-k">Oracle</div><div class="s-row-v">${badge('COMPLETED')}</div></div>
          <div class="s-row"><div class="s-row-k">Blockchain</div><div class="s-row-v">${badge(APP.state==='PAYMENT_RELEASED'?'COMPLETED':'RESERVED')}</div></div>
        </div>
        <div style="margin-top:12px;"><button class="s-btn" onclick="document.getElementById('tab-escrow').click()">VIEW ESCROW →</button></div>
      </div>
    </div>`;
}

function renderOperator() {
  const el = document.getElementById('operator-view');
  if (!el) return;
  el.innerHTML = `
    <div><div class="s-head">OPERATOR CONSOLE</div><div class="s-desc">Manage satellite resources and availability.</div></div>
    <div class="s-strip">
      <div class="s-strip-i"><div class="s-strip-l">LISTED RESOURCES</div><div class="s-strip-v">04</div></div>
      <div class="s-strip-i"><div class="s-strip-l">UPCOMING WINDOWS</div><div class="s-strip-v">03</div></div>
      <div class="s-strip-i"><div class="s-strip-l">ACTIVE BOOKINGS</div><div class="s-strip-v">01</div></div>
      <div class="s-strip-i"><div class="s-strip-l">EARNINGS</div><div class="s-strip-v">$186.00</div></div>
    </div>
    <div class="s-2col">
      <div>
        <div class="s-section">
          <div class="s-section-h">RESOURCES</div>
          <table class="s-tbl"><thead><tr><th>SATELLITE</th><th>OPERATOR</th><th>RESOURCE</th><th>BANDWIDTH</th><th>COVERAGE</th><th>STATUS</th></tr></thead><tbody>
            ${APP.resources.map((r,i)=>`<tr class="${i===APP.selectedResource?'sel':''}" style="cursor:pointer;" onclick="APP.selectedResource=${i};renderOperator();">
              <td>${r.id}</td><td>${r.op}</td><td>${r.res}</td><td>${r.bw} Mbps</td><td>${r.loc}</td><td>${badge(r.status)}</td>
            </tr>`).join('')}
          </tbody></table>
        </div>
      </div>
      <div>
        <div class="s-section">
          <div class="s-section-h">RESOURCE DETAIL · ${APP.resources[APP.selectedResource].id}</div>
          <div class="s-row"><div class="s-row-k">Orbit</div><div class="s-row-v">${APP.resources[APP.selectedResource].orbit}</div></div>
          <div class="s-row"><div class="s-row-k">Bandwidth</div><div class="s-row-v">${APP.resources[APP.selectedResource].bw} Mbps</div></div>
          <div class="s-row"><div class="s-row-k">Coverage</div><div class="s-row-v">${APP.resources[APP.selectedResource].loc}</div></div>
          <div class="s-row"><div class="s-row-k">Status</div><div class="s-row-v">${badge(APP.resources[APP.selectedResource].status)}</div></div>
        </div>
        <div class="s-section" style="margin-top:16px;">
          <div class="s-section-h">AVAILABILITY TIMELINE · TODAY</div>
          ${APP.opWindows.map(w=>`<div class="op-tl-row"><div class="op-tl-time">${w.time} UTC</div><div class="op-tl-bar ${w.status==='AVAILABLE'?'avail':'booked'}"></div><div style="font-family:var(--mono);font-size:9px;color:${w.status==='AVAILABLE'?'var(--ok)':'var(--warn)'};">${w.status}</div></div>`).join('')}
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;"><button class="s-btn">EDIT RESOURCE</button><button class="s-btn">VIEW WINDOWS</button></div>
      </div>
    </div>`;
}

function renderWallet() {
  const el = document.getElementById('wl-content');
  if (!el) return;
  el.innerHTML = `
    <div class="wl-addr"><span>${APP.wallet.addr}</span><button onclick="navigator.clipboard.writeText('${APP.wallet.addr}')">COPY</button></div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--text-m);margin-bottom:4px;">CONNECTED · ${APP.wallet.network}</div>
    <div class="wl-bal"><div class="wl-bl">AVAILABLE</div><div class="wl-bv">$${APP.wallet.available.toFixed(2)} USDC</div></div>
    <div class="wl-bal"><div class="wl-bl">IN ESCROW</div><div class="wl-bv">$${APP.wallet.inEscrow.toFixed(2)} USDC</div></div>
    <div class="wl-sh">RECENT ACTIVITY</div>
    ${APP.wallet.txs.slice(0,5).map(t=>`<div class="wl-tx"><div class="wl-tx-i">${t.label} · ${t.sat}</div><div class="wl-tx-a ${t.amount<0?'neg':'pos'}">${t.amount<0?'':'+'} $${Math.abs(t.amount).toFixed(2)}</div></div>`).join('')}
    <div class="wl-actions">
      <button class="s-btn" style="flex:1;">ADD FUNDS</button>
      <button class="s-btn" style="flex:1;" onclick="document.getElementById('tab-escrow').click();document.getElementById('wl-overlay').classList.remove('open');">VIEW ESCROW</button>
    </div>`;
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
        stats[2].innerHTML = '$' + px + '.00 USDC';
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
      ["SAT-07","escrow locked, $41",true],
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
  