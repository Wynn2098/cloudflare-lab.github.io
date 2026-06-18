const API = "https://cloudflarelab-api.wincapz20.workers.dev/";

let total = 0;
let bots = 0;
let events = [];

const ctx = document.getElementById("chart");

const chart = new Chart(ctx, {
type: "line",
data: {
labels: [],
datasets: [{
label: "Requests/sec",
data: [],
borderColor: "#f38020",
tension: 0.3
}]
},
options: {
animation: false
}
});

// --------------------
// SEND EVENT TO WORKER
// --------------------
async function sendEvent(type) {

await fetch(API, {
method: "POST",
body: JSON.stringify({ type })
});

}

// --------------------
// FETCH LIVE DATA
// --------------------
async function update() {

const res = await fetch(API);
const data = await res.json();

total = data.total;
bots = data.bots;
events = data.events;

document.getElementById("counter").innerText = total;
document.getElementById("botRate").innerText =
total ? Math.round((bots / total) * 100) + "%" : "0%";

// chart update
chart.data.labels = data.series.map(x => x.time);
chart.data.datasets[0].data = data.series.map(x => x.value);
chart.update();

// log
const log = document.getElementById("log");
log.innerHTML = data.events.slice(-20).map(e =>
`[${e.time}] ${e.type}`
).join("<br>");
}

// live refresh (WebSocket simulation)
setInterval(update, 1000);
