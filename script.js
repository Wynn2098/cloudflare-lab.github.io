const WORKER_URL = "https://cloudflarelab-api.wincapz20.workers.dev/";

let requestCount = 0;

let labelsArr = [];
let chartDataArr = [];

let statusMap = {};
let countryMap = {};

const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
type: "line",
data: {
labels: labelsArr,
datasets: [{
label: "Requests",
data: chartDataArr,
borderWidth: 2
}]
},
options: {
animation: false,
responsive: true
}
});

async function callWorker(statusCode, attackType = "normal") {

const res = await fetch(`${WORKER_URL}/?status=${statusCode}&type=${attackType}`);
const json = await res.json();

requestCount++;

document.getElementById("counter").innerText = requestCount;

// STATUS MAP
statusMap[json.status] = (statusMap[json.status] || 0) + 1;

// COUNTRY MAP
countryMap[json.country] = (countryMap[json.country] || 0) + 1;

updateUI(json);
}

function updateUI(res) {

labelsArr.push(new Date().toLocaleTimeString());
chartDataArr.push(requestCount);

if (labelsArr.length > 20) {
labelsArr.shift();
chartDataArr.shift();
}

chart.update();

// LOGS
document.getElementById("log").innerHTML =
`[${new Date().toLocaleTimeString()}]
STATUS: ${res.status}
COUNTRY: ${res.country}
BOT SCORE: ${res.botScore}
CACHE: ${res.cache}
WAF: ${res.waf}
DDoS FLAG: ${res.ddos}
-------------------<br>` + document.getElementById("log").innerHTML;

// STATUS BREAKDOWN
document.getElementById("statusBox").innerText =
JSON.stringify(statusMap, null, 2);

// COUNTRY BREAKDOWN
document.getElementById("countryBox").innerText =
JSON.stringify(countryMap, null, 2);
}

/* TRAFFIC BUTTONS */
function sendTraffic(){ callWorker(200, "normal"); }

function spamTraffic(){
for(let i=0;i<10;i++) callWorker(200, "burst");
}

function botTraffic(){
for(let i=0;i<10;i++) callWorker(403, "bot");
}

/* EDGE STATUS SIMULATION */
function sendStatus(code){
callWorker(code, "manual");
}
