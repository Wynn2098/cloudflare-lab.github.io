let count = 0;

const agents = {
  chrome_win: "Chrome / Windows UA",
  chrome_mac: "Chrome / macOS UA",
  safari_ios: "Safari / iOS UA",
  android: "Android UA",
  bot: "Cloudflare-Lab-Bot"
};

function log(msg) {
  document.getElementById("log").innerText = msg;
}

function inc() {
  count++;
  document.getElementById("counter").innerText = count;
}

/* -----------------------------
   PROFILE REQUESTS
----------------------------- */
function sendRequest(type) {
  fetch("/api/" + type, {
    headers: {
      "User-Agent": agents[type] || "default",
      "X-Lab-Type": type
    }
  });

  inc();
  log("Sent profile request: " + type);
}

/* -----------------------------
   NORMAL TRAFFIC
----------------------------- */
function normalTraffic() {
  fetch("/normal");
  inc();
  log("Normal traffic sent");
}

/* -----------------------------
   TRAFFIC SPIKE
----------------------------- */
function trafficSpike() {
  for (let i = 0; i < 100; i++) {
    fetch("/spike");
    inc();
  }
  log("Traffic spike sent (100 requests)");
}

/* -----------------------------
   ERROR TEST
----------------------------- */
function errorTest() {
  fetch("/this-page-does-not-exist");
  inc();
  log("404 test sent");
}

/* -----------------------------
   CACHE TEST
----------------------------- */
function cacheTest() {
  fetch("/image.jpg?cache=" + Date.now());
  inc();
  log("Cache test sent");
}

/* -----------------------------
   WAF TEST
----------------------------- */
function wafTest() {
  fetch("/admin-panel");
  inc();
  log("WAF test sent");
}

/* -----------------------------
   RATE LIMIT TEST
----------------------------- */
function rateLimit() {
  for (let i = 0; i < 20; i++) {
    fetch("/rate-test");
    inc();
  }
  log("Rate limit test sent");
}
