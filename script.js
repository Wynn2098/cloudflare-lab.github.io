const WORKER_URL = "https://cloudflarelab-api.wincapz20.workers.dev/";

let count = 0;

let labels = [];
let data = [];

let statusMap = {};
let countryMap = {};

const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
type: "line",
data: {
labels,
datasets: [{
label: "Requests",
data,
borderWidth: 2
}]
},
options: {
animation: false,
responsive: true
}
});

function random(arr){
return arr[Math.floor(Math.random() * arr.length)];
}

async function callWorker(status){

const res = await fetch(`${WORKER_URL}/?status=${status}`);
const json = await res.json();

count++;

document.getElementById("counter").innerText = count;

// STATUS MAP
statusMap[json.status] = (statusMap[json.status] || 0) + 1;

// COUNTRY MAP
countryMap[json.country] = (countryMap[json.country] || 0) + 1;

updateUI(json);
}

function updateUI(data){

labels.push(new Date().toLocaleTimeString());
data.push(count);

if(labels.length > 20){
labels.shift();
data.shift();
}

chart.update();

document.getElementById("log").innerHTML =
`[${new Date().toLocaleTimeString()}]
STATUS: ${data.status}
COUNTRY: ${data.country}
BOT: ${data.botScore}
CACHE: ${data.cache}
-------------------<br>` + document.getElementById("log").innerHTML;

document.getElementById("statusBox").innerText =
JSON.stringify(statusMap, null, 2);

document.getElementById("countryBox").innerText =
JSON.stringify(countryMap, null, 2);
}

/* BUTTONS */

function sendTraffic(){ callWorker(200); }
function spamTraffic(){ for(let i=0;i<10;i++) callWorker(200); }
function botTraffic(){ for(let i=0;i<10;i++) callWorker(403); }

function sendStatus(code){ callWorker(code); }
