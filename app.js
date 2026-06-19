/* =========================================================
   Cloudflare Security Lab
   app.js (Fixed & Enhanced)
========================================================= */

const API_URL = "https://cloudflarelab-api.wincapz20.workers.dev/";

const state = {
  totalRequests: 0,
  visitors: 0,
  botScore: 100, // Default starting score
  cacheHitRatio: 0,
  wafEvents: 0,
  rateLimited: 0,
  threatEvents: 0,
  ja3: 0,
  ja4: 0,
  cacheHits: 0,
  cacheMisses: 0,
  rps: 0,

  countries: {
    US: 0,
    DE: 0,
    JP: 0,
    SG: 0,
    PH: 0,
    BR: 0
  }
};

/* =========================================================
   DOM REFERENCES
========================================================= */

const totalRequestsEl = document.getElementById("totalRequests");
const rpsEl = document.getElementById("rps");
const visitorsEl = document.getElementById("visitors");
const botScoreEl = document.getElementById("botScore");
const cacheHitRatioEl = document.getElementById("cacheHitRatio");
const wafEventsEl = document.getElementById("wafEvents");
const rateLimitedEl = document.getElementById("rateLimited");
const threatEventsEl = document.getElementById("threatEvents");
const ja3CountEl = document.getElementById("ja3Count");
const ja4CountEl = document.getElementById("ja4Count");

const tlsJa3El = document.getElementById("tlsJa3");
const tlsJa4El = document.getElementById("tlsJa4");

const cacheHitsEl = document.getElementById("cacheHits");
const cacheMissesEl = document.getElementById("cacheMisses");
const cacheRatioEl = document.getElementById("cacheRatio");

const liveCounterEl = document.getElementById("liveCounter");
const activityLogEl = document.getElementById("activityLog");

const countryUS = document.getElementById("countryUS");
const countryDE = document.getElementById("countryDE");
const countryJP = document.getElementById("countryJP");
const countrySG = document.getElementById("countrySG");
const countryPH = document.getElementById("countryPH");
const countryBR = document.getElementById("countryBR");

const trafficAmountInput = document.getElementById("trafficAmount");
const systemStatus = document.getElementById("systemStatus");

/* =========================================================
   CHARTS
========================================================= */

const trafficChart = new Chart(
  document.getElementById("trafficChart"),
  {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Requests per Event",
        data: [],
        borderColor: "#f48120",
        backgroundColor: "rgba(244,129,32,0.1)",
        borderWidth: 3,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }
);

const securityChart = new Chart(
  document.getElementById("securityChart"),
  {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Threat Events",
        data: [],
        backgroundColor: "#ef4444"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }
);

/* =========================================================
   HELPERS
========================================================= */

function getTrafficAmount() {
  return parseInt(trafficAmountInput.value) || 100;
}

function timeLabel() {
  return new Date().toLocaleTimeString();
}

function randomCountry() {
  const countries = ["US", "DE", "JP", "SG", "PH", "BR"];
  return countries[Math.floor(Math.random() * countries.length)];
}

function addLog(message, type = "success") {
  const div = document.createElement("div");
  div.className = `log-entry log-${type}`;
  div.innerHTML = `[${timeLabel()}] ${message}`;
  
  activityLogEl.prepend(div);

  while (activityLogEl.children.length > 100) {
    activityLogEl.removeChild(activityLogEl.lastChild);
  }
}

/* =========================================================
   METRICS UPDATE
========================================================= */

function updateMetrics() {
  totalRequestsEl.textContent = state.totalRequests.toLocaleString();
  visitorsEl.textContent = state.visitors.toLocaleString();
  botScoreEl.textContent = `${state.botScore}%`;
  cacheHitRatioEl.textContent = `${state.cacheHitRatio}%`;
  wafEventsEl.textContent = state.wafEvents.toLocaleString();
  rateLimitedEl.textContent = state.rateLimited.toLocaleString();
  threatEventsEl.textContent = state.threatEvents.toLocaleString();
  
  ja3CountEl.textContent = state.ja3.toLocaleString();
  ja4CountEl.textContent = state.ja4.toLocaleString();
  tlsJa3El.textContent = state.ja3.toLocaleString();
  tlsJa4El.textContent = state.ja4.toLocaleString();

  cacheHitsEl.textContent = state.cacheHits.toLocaleString();
  cacheMissesEl.textContent = state.cacheMisses.toLocaleString();
  cacheRatioEl.textContent = `${state.cacheHitRatio}%`;

  liveCounterEl.textContent = state.totalRequests.toLocaleString();
  rpsEl.textContent = state.rps.toLocaleString();

  countryUS.textContent = state.countries.US.toLocaleString();
  countryDE.textContent = state.countries.DE.toLocaleString();
  countryJP.textContent = state.countries.JP.toLocaleString();
  countrySG.textContent = state.countries.SG.toLocaleString();
  countryPH.textContent = state.countries.PH.toLocaleString();
  countryBR.textContent = state.countries.BR.toLocaleString();
}

/* =========================================================
   CHARTS UPDATE
========================================================= */

function updateTrafficChart(currentRequests) {
  trafficChart.data.labels.push(timeLabel());
  trafficChart.data.datasets[0].data.push(currentRequests); // Graph current spike, not cumulative

  if (trafficChart.data.labels.length > 25) {
    trafficChart.data.labels.shift();
    trafficChart.data.datasets[0].data.shift();
  }
  trafficChart.update();
}

function updateSecurityChart(threatValue) {
  securityChart.data.labels.push(timeLabel());
  securityChart.data.datasets[0].data.push(threatValue);

  if (securityChart.data.labels.length > 25) {
    securityChart.data.labels.shift();
    securityChart.data.datasets[0].data.shift();
  }
  securityChart.update();
}

/* =========================================================
   WORKER API & FALLBACK SIMULATION
========================================================= */

async function callAPI(payload) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error("API response not OK");
    return await response.json();
    
  } catch (error) {
    // If API fails, fallback to local simulation so the dashboard still works seamlessly
    systemStatus.textContent = "Local Simulation";
    systemStatus.style.color = "var(--warning)";

    const isAttack = payload.action === "attack";
    const reqCount = payload.count || Math.floor(Math.random() * 50) + 10;
    
    return {
      count: reqCount,
      visitors: Math.floor(reqCount * 0.6),
      threatEvents: isAttack ? Math.floor(Math.random() * 20) + 5 : 0,
      wafEvents: payload.test === "waf" || isAttack ? Math.floor(Math.random() * 10) + 1 : 0,
      rateLimited: payload.test === "rate_limit" ? reqCount : 0,
      cacheHits: Math.floor(reqCount * 0.8),
      cacheMisses: Math.floor(reqCount * 0.2),
      requestsPerSecond: reqCount,
      ja3: Math.floor(Math.random() * 5),
      ja4: Math.floor(Math.random() * 5),
      country: randomCountry()
    };
  }
}

/* =========================================================
   PROCESS RESPONSE
========================================================= */

function applyResponse(data) {
  if (!data) return;

  state.totalRequests += data.count || 0;
  state.visitors += data.visitors || 0;
  
  if (data.botScore !== undefined) state.botScore = data.botScore;

  state.wafEvents += data.wafEvents || 0;
  state.rateLimited += data.rateLimited || 0;
  state.threatEvents += data.threatEvents || 0;
  state.ja3 += data.ja3 || 0;
  state.ja4 += data.ja4 || 0;
  state.cacheHits += data.cacheHits || 0;
  state.cacheMisses += data.cacheMisses || 0;
  state.rps = data.requestsPerSecond || data.count || 0;

  // Dynamically calculate cache hit ratio locally
  const totalCache = state.cacheHits + state.cacheMisses;
  if (totalCache > 0) {
    state.cacheHitRatio = Math.round((state.cacheHits / totalCache) * 100);
  }

  // Populate country analytics
  const countryCode = data.country || randomCountry();
  if (state.countries[countryCode] !== undefined) {
    state.countries[countryCode] += data.count || 1;
  }

  updateMetrics();
  updateTrafficChart(data.count || 0);

  if (data.threatEvents > 0) {
    updateSecurityChart(data.threatEvents);
  } else {
    // Keep the chart moving even when there are no threats
    updateSecurityChart(0);
  }
}

/* =========================================================
   TRAFFIC
========================================================= */

async function generateTraffic(type) {
  const count = getTrafficAmount();
  
  // Firing a real POST command to your API Worker 
  const result = await callAPI({
    action: "traffic",
    profile: type, // This tells the worker whether to simulate Chrome, iOS, or Googlebot
    count: count
  });

  applyResponse(result);
  addLog(`${type.toUpperCase()} profile traffic generated (${count} requests)`);
}

/* =========================================================
   ATTACKS
========================================================= */

async function simulateAttack(type) {
  const count = getTrafficAmount();
  const result = await callAPI({ action: "attack", attackType: type, count });
  applyResponse(result);
  addLog(`${type.toUpperCase()} attack simulated`, "danger");
}

/* =========================================================
   STATUS CODES
========================================================= */

async function simulateStatus(code) {
  try {
    // We point directly to the absolute URL of your API worker
    const response = await fetch(`https://cloudflarelab-api.wincapz20.workers.dev/status/${code}`);
    addLog(`Requested status ${code}. Cloudflare Edge replied with: ${response.status}`);
  } catch (e) {
    addLog(`Network or configuration error on status ${code}`, "danger");
  }
}
/* =========================================================
   SECURITY TESTS
========================================================= */

async function simulateStatus(code) {
  try {
    // CRITICAL: Change this to target your live API worker domain directly
    const response = await fetch(`https://cloudflarelab-api.wincapz20.workers.dev/status/${code}`);
    
    // This updates your custom dashboard log box with the response code
    applyResponse({ count: 1, requestsPerSecond: 1 }); 
    addLog(`Requested status ${code}. Cloudflare Edge replied with: ${response.status}`);
  } catch (e) {
    addLog(`Network or configuration error on status ${code}`, "danger");
  }
}
/* =========================================================
   BUTTON EVENTS
========================================================= */

document.getElementById("normalTrafficBtn").addEventListener("click", () => generateTraffic("normal"));
document.getElementById("trafficSpikeBtn").addEventListener("click", () => generateTraffic("spike"));
document.getElementById("botTrafficBtn").addEventListener("click", () => {
  generateTraffic("bot");
  state.botScore = Math.max(0, state.botScore - 15); // Naturally drop bot score
});

/* Profiles */
document.querySelectorAll("[data-profile]").forEach(btn => {
  btn.addEventListener("click", () => generateTraffic(btn.dataset.profile));
});

/* Attacks */
document.querySelectorAll("[data-attack]").forEach(btn => {
  btn.addEventListener("click", () => simulateAttack(btn.dataset.attack));
});

/* Status */
document.querySelectorAll("[data-status]").forEach(btn => {
  btn.addEventListener("click", () => simulateStatus(btn.dataset.status));
});

/* Security Tests */
document.getElementById("wafTestBtn").addEventListener("click", () => securityTest("waf"));
document.getElementById("rateLimitBtn").addEventListener("click", () => securityTest("rate_limit"));
document.getElementById("loginAttackBtn").addEventListener("click", () => securityTest("login"));
document.getElementById("cacheTestBtn").addEventListener("click", () => securityTest("cache"));
document.getElementById("errorTestBtn").addEventListener("click", () => securityTest("404"));

/* Bot Management (Previously missing listeners) */
document.getElementById("allowBotsBtn").addEventListener("click", () => {
  securityTest("allow_bots");
  state.botScore = 100;
  addLog("Bot protection minimized. Bots allowed.", "warning");
});
document.getElementById("challengeBotsBtn").addEventListener("click", () => {
  securityTest("challenge_bots");
  addLog("Managed Challenge deployed against suspicious traffic.");
});
document.getElementById("blockBotsBtn").addEventListener("click", () => {
  securityTest("block_bots");
  state.threatEvents += 50;
  addLog("Strict bot blocking enabled.", "success");
});
document.getElementById("verifiedBotBtn").addEventListener("click", () => {
  securityTest("verified_bot");
  addLog("Verified bot traffic allowed (e.g., Googlebot).");
});

/* =========================================================
   LIVE BACKGROUND TRAFFIC (Fixed to process real data)
========================================================= */

setInterval(() => {
  const bgRequests = Math.floor(Math.random() * 25) + 5;
  
  // Create a mock payload to process background traffic properly
  const bgData = {
    count: bgRequests,
    visitors: Math.floor(bgRequests * 0.4),
    cacheHits: Math.floor(bgRequests * 0.75),
    cacheMisses: Math.floor(bgRequests * 0.25),
    requestsPerSecond: bgRequests,
    country: randomCountry()
  };
  
  applyResponse(bgData);
}, 2500);

/* =========================================================
   INIT
========================================================= */

addLog("Cloudflare Security Lab initialized");
updateMetrics();
