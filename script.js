let count = 0;

function log(msg) {
  document.getElementById("log").innerText = msg;
}

function inc() {
  count++;
  document.getElementById("counter").innerText = count;
}

/* -----------------------------
   USER AGENT PROFILES
----------------------------- */

const agents = {
  chrome_win:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",

  chrome_mac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 Chrome/120 Safari/537.36",

  safari_ios:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Safari/605.1.15",

  android:
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",

  bot:
    "Cloudflare-Lab-Bot/1.0"
};

/* -----------------------------
   CORE REQUEST FUNCTION
----------------------------- */

function sendRequest(profile) {
  fetch("/", {
    method: "GET",
    headers: {
      "User-Agent": agents[profile] || agents.chrome_win,
      "X-Lab-Profile": profile,
      "X-Client-Type": "cloudflare-lab-simulator"
    }
  });

  inc();
  log("Sent request profile: " + profile);
}

/* -----------------------------
   NORMAL TRAFFIC
----------------------------- */

function normal() {
  fetch("/");
  inc();
  log("Normal request sent");
}

/* -----------------------------
   TRAFFIC SPIKE
----------------------------- */

function spike() {
  for (let i = 0; i < 150; i++) {
    fetch("/spike-test");
    inc();
  }
  log("Traffic spike sent (150 requests)");
}

/* -----------------------------
   ERROR TEST (Edge 404)
----------------------------- */

function errorTest() {
  fetch("/this-page-does-not-exist-" + Math.random());
  inc();
  log("404 test triggered");
}

/* -----------------------------
   CACHE TEST
----------------------------- */

function cacheTest() {
  fetch("/image.jpg?cache=" + Date.now());
  inc();
  log("Cache-bypass request sent");
}

/* -----------------------------
   HTTP VARIATION SIMULATION
----------------------------- */

function httpTest() {
  fetch("/api/test", {
    headers: {
      "X-Test-HTTP": "HTTP-1.1-simulated",
      "X-Edge-Case": "true"
    }
  });

  inc();
  log("HTTP variation request sent");
}

/* -----------------------------
   API TEST
----------------------------- */

function apiTest() {
  fetch("/api/data", {
    method: "POST",
    body: JSON.stringify({ test: "data" }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  inc();
  log("API request sent");
}
