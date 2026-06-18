let counter = 0;

// =========================
// LIVE CHART SETUP
// =========================
const ctx = document.getElementById("trafficChart");

const labels = [];
const dataPoints = [];

const trafficChart = new Chart(ctx, {
type: "line",
data: {
labels: labels,
datasets: [{
label: "Requests / sec",
data: dataPoints,
borderColor: "#f38020",
backgroundColor: "rgba(243,128,32,0.2)",
tension: 0.4
}]
},
options: {
responsive: true,
animation: false,
scales: {
y: { beginAtZero: true }
}
}
});

// =========================
// LOG SYSTEM (optimized)
// =========================
function log(msg) {
const logBox = document.getElementById("log");

const div = document.createElement("div");
div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;

logBox.prepend(div);

// limit logs (performance fix)
while (logBox.children.length > 60) {
logBox.removeChild(logBox.lastChild);
}
}

// =========================
// COUNTER + CHART UPDATE
// =========================
function updateMetrics(value = 1) {
counter += value;
document.getElementById("counter").innerText = counter;

// chart update
const time = new Date().toLocaleTimeString();

labels.push(time);
dataPoints.push(value);

// keep last 20 points only
if (labels.length > 20) {
labels.shift();
dataPoints.shift();
}

trafficChart.update();
}

// =========================
// SIMULATED "WEBSOCKET STREAM"
// =========================
setInterval(() => {
const randomTraffic = Math.floor(Math.random() * 5);

// simulate normal background traffic
updateMetrics(randomTraffic);
log(`Live traffic +${randomTraffic}`);
}, 1500);

// =========================
// TRAFFIC FUNCTIONS
// =========================
function normalTraffic() {
updateMetrics(1);
log("Normal request");
}

function trafficSpike() {
let i = 0;

const interval = setInterval(() => {
updateMetrics(3);
log("Traffic spike burst");

i++;
if (i > 10) clearInterval(interval);
}, 200);
}

function botSimulation() {
let i = 0;

const interval = setInterval(() => {
updateMetrics(2);
log("Bot request detected");

i++;
if (i > 8) clearInterval(interval);
}, 250);
}

// =========================
// PROFILE SIMULATION
// =========================
function sendRequest(type) {
updateMetrics(1);
log(`Request: ${type}`);
}

// =========================
// SECURITY SIMULATION
// =========================
function wafTest() {
updateMetrics(1);
log("WAF blocked suspicious request");
}

function rateLimit() {
updateMetrics(2);
log("Rate limit triggered (429)");
}

function loginAttack() {
let i = 0;

const interval = setInterval(() => {
updateMetrics(1);
log("Fake login attempt");

i++;
if (i > 6) clearInterval(interval);
}, 200);
}

function errorTest() {
updateMetrics(1);
log("404 generated");
}

function cacheTest() {
updateMetrics(1);
log("Cache HIT");
}

// =========================
// EDGE STATUS SIMULATION
// =========================
function sendStatus(code) {
updateMetrics(1);

const messages = {
200: "OK",
201: "Created",
202: "Accepted",
301: "Redirect",
302: "Found",
403: "Forbidden",
404: "Not Found",
410: "Gone",
429: "Rate Limited",
499: "Client Closed",
500: "Server Error",
502: "Bad Gateway",
503: "Service Unavailable"
};

log(`Edge ${code} - ${messages[code] || "Unknown"}`);
}
