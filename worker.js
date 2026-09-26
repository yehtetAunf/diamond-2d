const DEFAULT_STATE = {
  result: "79",
  set: "1,245.67",
  value: "87,899.01",
  resultLabel: "2D RESULT",
  date: "22/09/2026",
  updatedAt: "22/09/2026, 15:01:22",
  countdown: "00:38",
  slots: [
    {time:"5:00 PM",result:null},{time:"6:00 PM",result:null},
    {time:"7:00 PM",result:null},{time:"8:00 PM",result:null},
    {time:"9:00 PM",result:null},{time:"10:00 PM",result:null}
  ],
  history: []
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/state") {
      if (request.method === "GET") {
        return json(await readState(env));
      }

      if (request.method === "POST") {
        // Protect this endpoint with an ADMIN_KEY secret in production.
        const key = request.headers.get("x-admin-key");
        if (env.ADMIN_KEY && key !== env.ADMIN_KEY) {
          return new Response("Unauthorized", {status:401});
        }

        let body;
        try { body = await request.json(); }
        catch { return new Response("Invalid JSON", {status:400}); }

        const state = sanitize(body);
        await writeState(env, state);
        return json(state);
      }
    }

    return env.ASSETS.fetch(request);
  }
};

async function readState(env) {
  if (env.DIAMOND_DATA) {
    const saved = await env.DIAMOND_DATA.get("state", "json");
    if (saved) return saved;
  }
  return DEFAULT_STATE;
}

async function writeState(env, state) {
  if (!env.DIAMOND_DATA) return;
  await env.DIAMOND_DATA.put("state", JSON.stringify(state));
}

function sanitize(x) {
  const result = String(x.result ?? "").replace(/\D/g,"").slice(0,2).padStart(2,"0");
  const set = String(x.set ?? "").slice(0,30);
  const value = String(x.value ?? "").slice(0,30);
  return {
    result, set, value,
    resultLabel: String(x.resultLabel ?? "2D RESULT").slice(0,40),
    date: String(x.date ?? new Date().toLocaleDateString("en-GB")).slice(0,30),
    updatedAt: String(x.updatedAt ?? new Date().toLocaleString("en-GB")).slice(0,60),
    countdown: String(x.countdown ?? "--:--").slice(0,20),
    slots: Array.isArray(x.slots) ? x.slots.slice(0,12).map(s => ({
      time:String(s.time ?? "").slice(0,20),
      result:s.result == null ? null : String(s.result).replace(/\D/g,"").slice(0,2).padStart(2,"0")
    })) : DEFAULT_STATE.slots,
    history: Array.isArray(x.history) ? x.history.slice(0,30).map(h => ({
      result:String(h.result ?? "").slice(0,2),
      set:String(h.set ?? "").slice(0,30),
      value:String(h.value ?? "").slice(0,30),
      savedAt:String(h.savedAt ?? "").slice(0,60)
    })) : []
  };
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {"content-type":"application/json; charset=utf-8", "cache-control":"no-store"}
  });
}
