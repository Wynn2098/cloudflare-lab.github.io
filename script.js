let counter = 0;

function updateCounter() {
counter++;
document.getElementById("counter").innerText = counter;
}

function log(msg) {
const logBox = document.getElementById("log");
logBox.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}<br>` + logBox.innerHTML;
}

// Basic traffic
function normalTraffic() {
updateCounter();
log("Normal user request received");
}

function trafficSpike() {
for (let i = 0; i < 20; i++) {
setTimeout(() => {
updateCounter();
log("Traffic spike request");
}, i * 100);
}
}

function botSimulation() {
for (let i = 0; i < 10; i++) {
setTimeout(() => {
updateCounter();
log("Bot traffic detected");
}, i * 150);
}
}

// Profile traffic
function sendRequest(type) {
updateCounter();
log(`Request from profile: ${type}`);
}

// Security tests
function wafTest() {
updateCounter();
log("WAF triggered suspicious request blocked");
}

function rateLimit() {
updateCounter();
log("Rate limit triggered (429 simulated)");
}

function loginAttack() {
for (let i = 0; i < 5; i++) {
setTimeout(() => {
updateCounter();
log("Fake login attempt detected");
}, i * 200);
}
}

function errorTest() {
updateCounter();
log("404 error simulated");
}

function cacheTest() {
updateCounter();
log("Cache HIT simulated");
}

// Edge status codes
function sendStatus(code) {
updateCounter();

let message = "";

switch (code) {
case 200: message = "200 OK - Success"; break;
case 201: message = "201 Created"; break;
case 202: message = "202 Accepted"; break;
case 301: message = "301 Redirect"; break;
case 302: message = "302 Found"; break;
case 403: message = "403 Forbidden"; break;
case 404: message = "404 Not Found"; break;
case 410: message = "410 Gone"; break;
case 429: message = "429 Rate Limited"; break;
case 499: message = "499 Client Closed Request"; break;
case 500: message = "500 Server Error"; break;
case 502: message = "502 Bad Gateway"; break;
case 503: message = "503 Service Unavailable"; break;
default: message = `${code} Unknown`;
}

log(`Edge Response: ${message}`);
}
