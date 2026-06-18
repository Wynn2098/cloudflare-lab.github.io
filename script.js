const API = "https://cloudflarelab-api.yourname.workers.dev";

let count = 0;
let labels = [];
let values = [];

const ctx = document.getElementById("trafficChart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Requests",
      data: values,
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

async function sendRequest(profile = "Normal") {

  const status = random([200,200,200,301,302,403,404,429,500,502,503]);

  await fetch(`${API}?status=${status}&t=${Date.now()}`);

  log({
    profile,
    status,
    country: random(["PH","US","JP","SG"]),
    latency: Math.floor(Math.random() * 300)
  });

  update(status);
}

async function sendStatus(code) {
  await fetch(`${API}?status=${code}&t=${Date.now()}`);

  log({
    profile: "Manual Test",
    status: code,
    country: "PH",
    latency: 120
  });

  update(code);
}

function update(status){
  count++;
  document.getElementById("counter").innerText = count;

  labels.push(new Date().toLocaleTimeString());
  values.push(count);

  if(labels.length > 25){
    labels.shift();
    values.shift();
  }

  chart.update();
}

function log(data){
  const logBox = document.getElementById("log");

  logBox.innerHTML = `
  [${new Date().toLocaleTimeString()}]
  STATUS: ${data.status}
  PROFILE: ${data.profile}
  COUNTRY: ${data.country}
  LATENCY: ${data.latency}ms
  -------------------
  ` + logBox.innerHTML;
}

/* buttons */
function normalTraffic(){ sendRequest("Normal"); }
function trafficSpike(){ for(let i=0;i<20;i++) sendRequest("Spike"); }
function botSimulation(){ for(let i=0;i<15;i++) sendRequest("Bot"); }

function wafTest(){ sendStatus(403); }
function rateLimit(){ sendStatus(429); }
function errorTest(){ sendStatus(404); }
function cacheTest(){ sendRequest("Cache"); }

setInterval(()=>sendRequest("Auto"), 4000);
