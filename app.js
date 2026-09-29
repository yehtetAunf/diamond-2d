const TIMES = [
  "05:00 PM", "06:00 PM", "07:00 PM",
  "08:00 PM", "09:00 PM", "10:00 PM"
];

const slots = document.getElementById("slots");
slots.innerHTML = TIMES.map(time => `
  <article class="slot">
    <div class="slot-time"><span>◷</span> ${time}</div>
    <div class="slot-number">--</div>
  </article>
`).join("");

const $ = (id) => document.getElementById(id);
const history = $("history");
const adminPanel = $("adminPanel");

function localState() {
  try { return JSON.parse(localStorage.getItem("diamond2dState")) || null; }
  catch { return null; }
}

function formatTwo(value) {
  const s = String(value ?? "").trim();
  if (!s || s === "--") return "--";
  return s.padStart(2, "0").slice(-2);
}

function render(data) {
  if (!data) return;

  const result = formatTwo(data.result);
  $("mainNumber").innerHTML = result === "--"
    ? "<span>--</span>"
    : `<span>${result[0]}</span><b>${result[1]}</b>`;

  $("setValue").textContent = data.set ?? "--";
  $("valueValue").textContent = data.value ?? "--";

  $("updated").textContent =
    `✓ Updated ${data.updatedAt || "--"}${data.countdown ? ` | ${data.countdown}` : ""}`;

  if (Array.isArray(data.slots)) {
    document.querySelectorAll(".slot-number").forEach((el, i) => {
      el.textContent = data.slots[i]?.result ? formatTwo(data.slots[i].result) : "--";
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

  box.innerHTML = items.slice(0, 30).map(x => `
    <div class="history-row">
      <b>${formatTwo(x.result)}</b>
      <span>SET ${x.set ?? "--"}</span>
      <span>VALUE ${x.value ?? "--"}</span>
      <small>${x.savedAt ?? "--"}</small>
    </div>
  `).join("");
}

async function loadState() {
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (!res.ok) throw new Error("API unavailable");

    const data = await res.json();
    render(data);
    localStorage.setItem("diamond2dState", JSON.stringify(data));

    $("adminCurrentResult").textContent = data.result || "--";
    $("adminCurrentMarket").textContent =
      `SET ${data.set || "--"} · VALUE ${data.value || "--"}`;
  } catch {
    const cached = localState();
    if (cached) {
      render(cached);
      $("adminCurrentResult").textContent = cached.result || "--";
      $("adminCurrentMarket").textContent =
        `SET ${cached.set || "--"} · VALUE ${cached.value || "--"}`;
    } else {
      render({
        result: "43",
        set: "7,952.84",
        value: "89,583.45",
        updatedAt: new Date().toLocaleString("en-GB"),
        slots: [
          {result:"04"}, {result:"63"}, {result:"28"},
          {result:"70"}, {result:"43"}, {result:null}
        ]
      });
    }
  }
}

function openAdmin() {
  adminPanel.classList.remove("hidden");
  const current = localState();

  if (current) {
    $("adminResult").value = current.result || "";
    $("adminSet").value = current.set || "";
    $("adminValue").value = current.value || "";
    $("adminCurrentResult").textContent = current.result || "--";
    $("adminCurrentMarket").textContent =
      `SET ${current.set || "--"} · VALUE ${current.value || "--"}`;
  }
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
  const now = new Date().toLocaleString("en-GB");

  const payload = {
    ...previous,
    result: result.padStart(2, "0"),
    set,
    value,
    updatedAt: now,
    savedAt: now,
    history: [
      { result: result.padStart(2, "0"), set, value, savedAt: now },
      ...(previous.history || [])
    ].slice(0, 30)
  };

  try {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());

    const saved = await res.json();
    render(saved);
    localStorage.setItem("diamond2dState", JSON.stringify(saved));
    $("saveMessage").textContent = "✓ Saved — User App updated.";
    $("adminCurrentResult").textContent = saved.result || "--";
    $("adminCurrentMarket").textContent =
      `SET ${saved.set || "--"} · VALUE ${saved.value || "--"}`;
  } catch {
    localStorage.setItem("diamond2dState", JSON.stringify(payload));
    render(payload);
    $("saveMessage").textContent = "✓ Saved locally. Cloudflare D1 binding မချိတ်ရသေးပါ။";
  }
});

$("closeAdmin").addEventListener("click", () => {
  adminPanel.classList.add("hidden");
});

$("menuBtn").addEventListener("click", openAdmin);

$("historyBtn").addEventListener("click", () => {
  history.classList.toggle("hidden");
});

$("live3dBtn").addEventListener("click", () => {
  alert("3D LIVE");
});

loadState();
setInterval(loadState, 15000);
