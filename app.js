const times = [
  ["5:00 PM","#1477dc"],["6:00 PM","#e0a400"],["7:00 PM","#0caa65"],
  ["8:00 PM","#7227d6"],["9:00 PM","#e52b32"],["10:00 PM","#1477dc"]
];

const slots = document.getElementById("slots");
slots.innerHTML = times.map(([time,color]) => `
  <article class="slot" style="--c:${color}">
    <h3>${time}</h3>
    <div class="slot-body">
      <div class="gem">◆</div>
      <div class="num">--</div>
      <button class="buy" type="button">🛒 DIAMOND<br>BUY</button>
    </div>
  </article>`).join("");

const $ = (id) => document.getElementById(id);
const history = $("history");
const adminPanel = $("adminPanel");

function localState() {
  try { return JSON.parse(localStorage.getItem("diamond2dState")) || null; }
  catch { return null; }
}

function render(data) {
  if (!data) return;
  const result = String(data.result ?? "--").padStart(2, "0");
  $("mainNumber").innerHTML = `<span>${result[0] ?? ""}</span><b>${result[1] ?? ""}</b>`;
  $("setValue").textContent = data.set ?? "--";
  $("valueValue").textContent = data.value ?? "--";
  $("today").textContent = data.date ?? new Date().toLocaleDateString("en-GB");
  $("resultLabel").textContent = data.resultLabel || "2D RESULT";
  $("updated").textContent = `✓ Updated ${data.updatedAt || "--"} | ${data.countdown || "--"}`;

  if (Array.isArray(data.slots)) {
    document.querySelectorAll(".slot").forEach((el, i) => {
      const n = data.slots[i]?.result;
      el.querySelector(".num").textContent = n ?? "--";
    });
  }
  renderHistory(data.history || []);
}

function renderHistory(items) {
  const box = $("historyList");
  if (!items.length) {
    box.innerHTML = "<p>History records will appear here after results are saved.</p>";
    return;
  }
  box.innerHTML = items.slice(0, 30).map(x =>
    `<div class="history-row"><b>${x.result}</b><span>SET ${x.set}</span><span>VALUE ${x.value}</span><small>${x.savedAt}</small></div>`
  ).join("");
}

async function loadState() {
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (!res.ok) throw new Error("API unavailable");
    const data = await res.json();
    render(data);
    localStorage.setItem("diamond2dState", JSON.stringify(data));
  } catch {
    const cached = localState();
    if (cached) render(cached);
    else render({
      result: "79", set: "1,245.67", value: "87,899.01",
      date: new Date().toLocaleDateString("en-GB"),
      updatedAt: new Date().toLocaleTimeString("en-US"),
      countdown: "--:--"
    });
  }
}

function openAdmin() {
  adminPanel.classList.remove("hidden");
  const current = localState();
  if (current) {
    $("adminResult").value = current.result || "";
    $("adminSet").value = current.set || "";
    $("adminValue").value = current.value || "";
  }
  adminPanel.scrollIntoView({behavior:"smooth", block:"center"});
}

$("saveAdmin").addEventListener("click", async () => {
  const result = $("adminResult").value.trim();
  const set = $("adminSet").value.trim();
  const value = $("adminValue").value.trim();
  if (!/^\d{1,2}$/.test(result) || !set || !value) {
    $("saveMessage").textContent = "2D Result / SET / VALUE အားလုံးထည့်ပါ။";
    return;
  }

  const previous = localState() || {};
  const payload = {
    ...previous,
    result: result.padStart(2, "0"),
    set, value,
    updatedAt: new Date().toLocaleString("en-GB"),
    savedAt: new Date().toLocaleString("en-GB"),
    history: [
      {result: result.padStart(2, "0"), set, value, savedAt: new Date().toLocaleString("en-GB")},
      ...(previous.history || [])
    ].slice(0,30)
  };

  try {
    const res = await fetch("/api/state", {
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();
    render(saved);
    localStorage.setItem("diamond2dState", JSON.stringify(saved));
    $("saveMessage").textContent = "✓ Saved — User App updated.";
  } catch {
    // Local fallback keeps the SAVE-before-update behavior working during setup.
    localStorage.setItem("diamond2dState", JSON.stringify(payload));
    render(payload);
    $("saveMessage").textContent = "✓ Saved locally. Cloudflare KV binding မချိတ်ရသေးပါ။";
  }
});

$("closeAdmin").addEventListener("click", () => adminPanel.classList.add("hidden"));
$("navSettings").addEventListener("click", openAdmin);
$("menuBtn").addEventListener("click", openAdmin);
$("historyBtn").addEventListener("click", () => history.classList.toggle("hidden"));
$("navHistory").addEventListener("click", () => history.classList.toggle("hidden"));

document.querySelectorAll(".buy").forEach(btn => btn.addEventListener("click", () => {
  alert("Diamond Buy");
}));

loadState();
setInterval(loadState, 15000);
