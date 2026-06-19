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

/* =========================================================
   CHARTS (Restored to Cloudflare Orange Theme)
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
        borderColor: "#f48120",          // <-- True Cloudflare Orange for the line
        backgroundColor: "rgba(244, 129, 32, 0.15)", // <-- Faded orange for the wave glow
        borderWidth: 3,
        tension: 0.3,                     // <-- Keeps the line smooth and wavy
        fill: true                        // <-- Enables the glow under the wave
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
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,   // <-- CRITICAL: Forces bars to sit on a flat baseline
          ticks: {
            stepSize: 1        // <-- Keeps integers clean instead of decimals like 0.1, 0.2
          }
        }
      }
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

/* =========================================================
   UPDATED TRAFFIC LOOPS (Sends 100 Real Requests)
========================================================= */

async function generateTraffic(type) {
  addLog(`Initiating real network spike: Sending 100 ${type.toUpperCase()} requests...`, "info");

  // This loop physically fires 100 individual requests across the internet
  for (let i = 0; i < 100; i++) {
    // We send a count of 1 per request so your UI and real Cloudflare align perfectly
    callAPI({
      action: "traffic",
      profile: type,
      count: 1 
    }).then(result => {
      if (result) applyResponse(result);
    });
    
    // Tiny 10-millisecond pause between requests so your browser doesn't freeze
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  addLog(`Finished sending 100 real ${type.toUpperCase()} requests to the Edge.`);
}

async function simulateAttack(type) {
  addLog(`🔥 Initiating real attack spike: Sending 100 ${type.toUpperCase()} exploits...`, "danger");

  for (let i = 0; i < 100; i++) {
    callAPI({
      action: "attack",
      attackType: type,
      count: 1
    }).then(result => {
      if (result) applyResponse(result);
    });
    
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  addLog(`Finished sending 100 real ${type.toUpperCase()} attacks to the Edge.`, "warning");
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

/* =========================================================
   UPDATED STATUS CODE SIMULATOR (Loops based on input amount)
========================================================= */

async function simulateStatus(code) {
  // 1. Get the current number typed in your "Traffic Amount" box
  const amount = getTrafficAmount();
  
  addLog(`Sending ${amount} real requests for HTTP Status ${code}...`, "info");

  // 2. Loop and physically fire that exact amount of requests
  for (let i = 0; i < amount; i++) {
    fetch(`${API_URL}status/${code}`)
      .then(response => {
        // Track the data inside your dashboard metrics state
        applyResponse({ count: 1, requestsPerSecond: 1 });
      })
      .catch(err => {
        console.error("Status request failed:", err);
      });

    // 10-millisecond delay so your browser handles the network traffic smoothly
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  addLog(`Successfully sent ${amount} real ${code} status codes to the Edge.`, "success");
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
   LIVE BACKGROUND TRAFFIC SIMULATOR (Fixed for Wavy Lines)
========================================================= */

setInterval(() => {
  // 1. Generate a naturally fluctuating mock background traffic value
  // This picks a random number between 15 and 45 requests per interval
  const backgroundRequestCount = Math.floor(Math.random() * 30) + 15;
  
  // 2. Mock calculating the requests per second metric dynamically
  state.rps = backgroundRequestCount;
  
  // 3. Update text metrics on the screen
  updateMetrics();
  
  // 4. CRITICAL: Pass the fluctuating value directly to the traffic chart
  // This gives the chart different high/low points to build the wave format!
  updateTrafficChart(backgroundRequestCount);

}, 3000); // Runs every 3 seconds so the timestamps have clear, readable gaps

/* =========================================================
   INIT
========================================================= */

addLog("Cloudflare Security Lab initialized");
updateMetrics();
