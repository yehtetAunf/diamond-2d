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
      if (!env.DB) return json({error:"D1 binding DB is not configured."}, 500);

      if (request.method === "GET") {
        return json(await readState(env.DB));
      }

      if (request.method === "POST") {
        let body;
        try { body = await request.json(); }
        catch { return json({error:"Invalid JSON"}, 400); }

        const state = sanitize(body);
        const now = state.updatedAt || new Date().toLocaleString("en-GB");
        const date = state.date || new Date().toLocaleDateString("en-GB");

        try {
          await env.DB.batch([
            env.DB.prepare(`UPDATE current_result SET result=?, set_value=?, value=?, updated_at=? WHERE id=1`)
              .bind(state.result, state.set, state.value, now),
            env.DB.prepare(`INSERT INTO history (result, set_value, value, created_at) VALUES (?, ?, ?, ?)`)
              .bind(state.result, state.set, state.value, now)
          ]);
          return json(await readState(env.DB));
        } catch (e) {
          return json({error:"D1 save failed", detail:String(e?.message || e)}, 500);
        }
      }

      return new Response("Method Not Allowed", {status:405});
    }

    return env.ASSETS.fetch(request);
  }
};

async function readState(db) {
  try {
    const row = await db.prepare(`SELECT id, result, set_value, value, updated_at FROM current_result WHERE id=1`).first();
    const rows = await db.prepare(`SELECT result, set_value, value, created_at FROM history ORDER BY id DESC LIMIT 30`).all();
    if (!row) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      result: row.result,
      set: row.set_value,
      value: row.value,
      updatedAt: row.updated_at,
      date: new Date().toLocaleDateString("en-GB"),
      history: (rows.results || []).map(h => ({
        result: h.result,
        set: h.set_value,
        value: h.value,
        savedAt: h.created_at
      }))
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function sanitize(x) {
  const result = String(x.result ?? "").replace(/\D/g,"").slice(0,2).padStart(2,"0");
  const set = String(x.set ?? "").slice(0,30);
  const value = String(x.value ?? "").slice(0,30);
  return {
    result,
    set,
    value,
    updatedAt: String(x.updatedAt ?? new Date().toLocaleString("en-GB")).slice(0,60),
    date: String(x.date ?? new Date().toLocaleDateString("en-GB")).slice(0,30)
  };
}

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type":"application/json; charset=utf-8",
      "cache-control":"no-store"
    }
  });
}
