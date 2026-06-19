/* =========================================================
   Cloudflare Security Lab
   app.js
========================================================= */

const API_URL = "https://cloudflarelab-api.wincapz20.workers.dev/";

const state = {
  totalRequests: 0,
  visitors: 0,
  botScore: 100,
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
        label: "Requests",
        data: [],
        borderWidth: 3,
        tension: 0.3
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
  div.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
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

  countryUS.textContent = state.countries.US;
  countryDE.textContent = state.countries.DE;
  countryJP.textContent = state.countries.JP;
  countrySG.textContent = state.countries.SG;
  countryPH.textContent = state.countries.PH;
  countryBR.textContent = state.countries.BR;
}

function updateTrafficChart(value) {
  trafficChart.data.labels.push(timeLabel());
  trafficChart.data.datasets[0].data.push(value);

  if (trafficChart.data.labels.length > 25) {
    trafficChart.data.labels.shift();
    trafficChart.data.datasets[0].data.shift();
  }
  trafficChart.update();
}

function updateSecurityChart(value) {
  securityChart.data.labels.push(timeLabel());
  securityChart.data.datasets[0].data.push(value);

  if (securityChart.data.labels.length > 25) {
    securityChart.data.labels.shift();
    securityChart.data.datasets[0].data.shift();
  }
  securityChart.update();
}

/* =========================================================
   WORKER API CALL
========================================================= */

async function callAPI(payload) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    addLog(`Worker Error: ${error.message}`, "danger");
    systemStatus.textContent = "Worker Offline";
    return null;
  }
}

/* =========================================================
   PROCESS RESPONSE (Your New Fixed Function Added Here)
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
   TRAFFIC EVENTS
========================================================= */

async function generateTraffic(type) {
  const count = getTrafficAmount();
  const result = await callAPI({
    action: "traffic",
    profile: type,
    count: count
  });
  applyResponse(result);
  addLog(`${type.toUpperCase()} traffic generated (${count})`);
}

async function simulateAttack(type) {
  const count = getTrafficAmount();
  const result = await callAPI({
    action: "attack",
    attackType: type,
    count: count
  });
  applyResponse(result);
  addLog(`${type.toUpperCase()} attack simulated`, "warning");
}

async function simulateStatus(code) {
  try {
    // Point directly to your live API worker status path
    const response = await fetch(`${API_URL}status/${code}`);
    applyResponse({ count: 1, requestsPerSecond: 1 });
    addLog(`Requested status ${code}. Cloudflare Edge replied with: ${response.status}`);
  } catch (e) {
    addLog(`Network or configuration error on status ${code}`, "danger");
  }
}

async function securityTest(type) {
  const result = await callAPI({
    action: "security",
    test: type
  });
  applyResponse(result);
  addLog(`${type} executed`);
}

/* =========================================================
   BUTTON EVENTS LISTENERS
========================================================= */

document.getElementById("normalTrafficBtn").addEventListener("click", () => generateTraffic("normal"));
document.getElementById("trafficSpikeBtn").addEventListener("click", () => generateTraffic("spike"));
document.getElementById("botTrafficBtn").addEventListener("click", () => generateTraffic("bot"));

/* Profiles */
document.querySelectorAll("[data-profile]").forEach(btn => {
  btn.addEventListener("click", () => generateTraffic(btn.dataset.profile));
});

/* Attacks */
document.querySelectorAll("[data-attack]").forEach(btn => {
  btn.addEventListener("click", () => simulateAttack(btn.dataset.attack));
});

/* Status Codes */
document.querySelectorAll("[data-status]").forEach(btn => {
  btn.addEventListener("click", () => simulateStatus(btn.dataset.status));
});

/* Security Testing Buttons */
document.getElementById("wafTestBtn").addEventListener("click", () => securityTest("waf"));
document.getElementById("rateLimitBtn").addEventListener("click", () => securityTest("rate_limit"));
document.getElementById("loginAttackBtn").addEventListener("click", () => securityTest("login"));
document.getElementById("cacheTestBtn").addEventListener("click", () => securityTest("cache"));
document.getElementById("errorTestBtn").addEventListener("click", () => securityTest("404"));

/* Bot Management Buttons */
document.getElementById("allowBotsBtn").addEventListener("click", () => securityTest("allow_bots"));
document.getElementById("challengeBotsBtn").addEventListener("click", () => securityTest("challenge_bots"));
document.getElementById("blockBotsBtn").addEventListener("click", () => securityTest("block_bots"));
document.getElementById("verifiedBotBtn").addEventListener("click", () => securityTest("verified_bot"));

/* =========================================================
   LIVE BACKGROUND TRAFFIC SIMULATOR
========================================================= */

setInterval(() => {
  state.rps = Math.floor(Math.random() * 4000);
  updateMetrics();
}, 2000);

/* =========================================================
   INIT
========================================================= */

addLog("Cloudflare Security Lab initialized");
updateMetrics();
