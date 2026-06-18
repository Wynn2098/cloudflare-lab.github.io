let counter = 0;

// ======================
// DATA BUFFERS (IMPORTANT)
// ======================
let eventBuffer = 0;
let logBuffer = [];

// ======================
// CHART SETUP
// ======================
const ctx = document.getElementById("trafficChart");

const labels = [];
const dataPoints = [];

const trafficChart = new Chart(ctx, {
type: "line",
data: {
labels,
datasets: [{
label: "Requests / sec",
data: dataPoints,
borderColor: "#f38020",
tension: 0.4
}]
},
options: {
animation: false,
responsive: true,
scales: { y: { beginAtZero: true } }
}
});

// ======================
// FAST LOG (NO INNERHTML)
// ======================
function log(msg) {
logBuffer.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
if (logBuffer.length > 30) logBuffer.shift();
}

// render logs slowly (NOT instantly)
setInterval(() => {
const box = document.getElementById("log");
box.innerHTML = logBuffer.map(l => `<div>${l}</div>`).join("");
}, 1000);

// ======================
// CORE ENGINE (BATCHED UPDATE)
// ======================
function emitTraffic(value = 1, message = "request") {
counter += value;
eventBuffer += value;
log(message);

document.getElementById("counter").innerText = counter;
}

// ======================
// CHART UPDATE LOOP (IMPORTANT FIX)
// ======================
setInterval(() => {
const value = eventBuffer;

const time = new Date().toLocaleTimeString();

labels.push(time);
dataPoints.push(value);

// keep only last 15 points
if (labels.length > 15) {
labels.shift();
dataPoints.shift();
}

trafficChart.update();

eventBuffer = 0;
}, 1000);

// ======================
// SIMULATED BACKGROUND TRAFFIC
// ======================
setInterval(() => {
emitTraffic(Math.floor(Math.random() * 3), "Live traffic stream");
}, 1200);

// ======================
// BUTTON FUNCTIONS
// ======================
function normalTraffic() {
emitTraffic(1, "Normal request");
}

function trafficSpike() {
for (let i = 0; i < 5; i++) {
setTimeout(() => {
emitTraffic(3, "Spike request");
}, i * 150);
}
}

function botSimulation() {
for (let i = 0; i < 5; i++) {
setTimeout(() => {
emitTraffic(2, "Bot request");
}, i * 200);
}
}

function sendRequest(type) {
emitTraffic(1, `Profile: ${type}`);
}

function wafTest() {
emitTraffic(1, "WAF blocked request");
}

function rateLimit() {
emitTraffic(2, "Rate limit hit (429)");
}

function loginAttack() {
for (let i = 0; i < 4; i++) {
setTimeout(() => {
emitTraffic(1, "Login attempt blocked");
}, i * 250);
}
}

function errorTest() {
emitTraffic(1, "404 error");
}

function cacheTest() {
emitTraffic(1, "Cache HIT");
}

function sendStatus(code) {
emitTraffic(1, `Edge status ${code}`);
}
