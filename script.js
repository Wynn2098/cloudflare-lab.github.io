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

/* -------------------------
   PROFILE REQUESTS
------------------------- */
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

/* -------------------------
   BASIC TRAFFIC
------------------------- */
function normalTraffic() {
  fetch("/normal");
  inc();
  log("Normal traffic sent");
}

function trafficSpike() {
  for (let i = 0; i < 100; i++) {
    fetch("/spike");
    inc();
  }
  log("Traffic spike sent (100 requests)");
}

function botSimulation() {
  for (let i = 0; i < 30; i++) {
    fetch("/bot");
    inc();
  }
  log("Bot simulation sent (30 requests)");
}

/* -------------------------
   SECURITY TESTS
------------------------- */
function wafTest() {
  fetch("/admin-panel");
  inc();
  log("WAF test sent");
}

function rateLimit() {
  for (let i = 0; i < 20; i++) {
    fetch("/rate-test");
    inc();
  }
  log("Rate limit test sent");
}

function loginAttack() {
  for (let i = 0; i < 15; i++) {
    fetch("/login", { method: "POST" });
    inc();
  }
  log("Fake login attack simulation sent");
}

function errorTest() {
  fetch("/this-page-does-not-exist");
  inc();
  log("404 test sent");
}

function cacheTest() {
  fetch("/image.jpg?cache=" + Date.now());
  inc();
  log("Cache test sent");
}

/* -------------------------
   EDGE STATUS SIMULATOR
------------------------- */
function sendStatus(code) {
  fetch("/status/" + code)
    .then(() => {
      inc();
      log("Edge Status simulated: " + code);
    })
    .catch(() => {
      inc();
      log("Edge Status simulated (offline mode): " + code);
    });
}
