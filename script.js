const API = "https://cloudflarelab-api.yourname.workers.dev";

let total = 0;

let chartLabels = [];
let chartData = [];

let statusMap = {};
let countryMap = {};
let botScores = [];

const ctx = document.getElementById("trafficChart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: chartLabels,
    datasets: [{
      label: "Requests/sec",
      data: chartData,
      borderWidth: 2
    }]
  },
  options: {
    animation: false,
    responsive: true
  }
});

function updateChart() {
  chartLabels.push(new Date().toLocaleTimeString());
  chartData.push(total);

  if (chartLabels.length > 30) {
    chartLabels.shift();
    chartData.shift();
  }

  chart.update();
}

function updateStats(data) {

  // STATUS BREAKDOWN
  statusMap[data.edgeStatus] = (statusMap[data.edgeStatus] || 0) + 1;

  // COUNTRY MAP
  countryMap[data.country] = (countryMap[data.country] || 0) + 1;

  // BOT SCORE
  botScores.push(data.botScore);

  if (botScores.length > 100) botScores.shift();

  renderStats();
}

function renderStats() {
  console.clear();
  console.log("STATUS MAP:", statusMap);
  console.log("COUNTRY MAP:", countryMap);
  console.log("AVG BOT SCORE:",
    botScores.reduce((a,b)=>a+b,0)/botScores.length
  );
}

async function sendRequest(profile="normal") {

  const statusPool = [200,200,200,301,302,403,404,429,500,502,503];
  const status = statusPool[Math.floor(Math.random()*statusPool.length)];

  const res = await fetch(`${API}?status=${status}&t=${Date.now()}`);
  const data = await res.json();

  total++;

  document.getElementById("counter").innerText = total;

  log({
    profile,
    ...data
  });

  updateStats(data);
  updateChart();
}

async function sendStatus(code) {
  const res = await fetch(`${API}?status=${code}&t=${Date.now()}`);
  const data = await res.json();

  total++;

  document.getElementById("counter").innerText = total;

  log({
    profile: "manual",
    ...data
  });

  updateStats(data);
  updateChart();
}

function log(d) {
  const box = document.getElementById("log");

  box.innerHTML = `
[${new Date().toLocaleTimeString()}]
STATUS: ${d.edgeStatus}
COUNTRY: ${d.country}
BOT SCORE: ${d.botScore}
CACHE: ${d.cache}
PROFILE: ${d.profile}
-------------------
` + box.innerHTML;
}

/* TRAFFIC MODES */
function normalTraffic(){ sendRequest("normal"); }
function trafficSpike(){ for(let i=0;i<25;i++) sendRequest("spike"); }
function botSimulation(){ for(let i=0;i<20;i++) sendRequest("bot"); }

function wafTest(){ sendStatus(403); }
function rateLimit(){ sendStatus(429); }
function errorTest(){ sendStatus(404); }

setInterval(()=> sendRequest("auto"), 3000);
